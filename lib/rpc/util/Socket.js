//引入hession.js
const hessian = require('hessian.js');
const net = require('net'); //网络库
const url = require('url');
const qs = require('querystring');
const Q = require('q');
const DEFAULT_LEN = 8388608; // 8 * 1024 * 1024 //默认参数buffer长度

const ERROR = {
    '100': 'create buffer failed ',
    '102': '连接服务失败 ',
    '103': '服务不可用',
    '104': '未找到对应的method',
    '105': 'socket连接错误',
    '106': '远程服务无响应，请重试',
    '107': '该服务未返回任何数据',
    '108': '请求参数不合法或类型不一致',
    '109': 'hessian decoder error ',
    '110': 'socket已经关闭',
};

var SocketClient = function() {
    this._dubboVersion = '2.5.3';
    this._group = '';
};

SocketClient.prototype.execute = function(server, service, method, version, args) {
    console.log("server: " + JSON.stringify(server) + " service = " + service + " method = " + method + " args = " + JSON.stringify(args));
    var q = Q.defer();
    var _this = this,
        buffer;
    try {
        buffer = _this._createBuffer(service, method, version, args);
    } catch (e) {
        q.reject({
            code: '100',
            error: e.message || ERROR['100']
        });
    }

    _this._fetchData(_this.serverIpAndPort(server), buffer, method)
        .then(function(data) {
            q.resolve(data);
        })
        .catch(function(err) {
            q.reject(err);
        });
    return q.promise;
};

SocketClient.prototype.serverIpAndPort = function(server) {
    var ips = server.split(":");
    return {
        host: ips[0],
        port: ips[1]
    };
};

SocketClient.prototype._fetchData = function(zoo, buffer, method) {
    var q = Q.defer();

    var bl = 16;
    var host = zoo.host;
    var port = zoo.port;
    var ret = null;
    var chunks = [];
    var tryCount = 0;
    var heap, ret;

    var client = new net.Socket();

    //connect
    client.connect(port, host, function() {
        client.write(buffer);
    });

    //发送数据
    client.on('data', function(chunk) {

        if (!chunks.length) {
            var arr = Array.prototype.slice.call(chunk.slice(0, 16));
            var i = 0;
            while (i < 3) {
                bl += arr.pop() * Math.pow(255, i++);
            }
        }

        chunks.push(chunk);
        heap = Buffer.concat(chunks);
        (heap.length >= bl) && client.destroy();
    });

    // 105 socket connection error 
    client.on('error', function(err) {
        client.destroy();
        q.reject({
            code: '105',
            error: ERROR['105'] + (err.message || err)
        });
    });

    // 110 socket closed
    client.on('close', function(err) {

        if (err) {
            q.reject({
                code: '110',
                error: ERROR['110'] + (err.message || '')
            });
        }
        // 106 service response error
        if (heap[3] !== 20) {
            ret = heap.slice(18, heap.length - 1).toString();
            q.reject({
                code: '106',
                error: ERROR['106'] + ret
            });
        }

        // 107 service void return
        if (heap[3] === 20 && heap[15] === 1) {
            q.resolve(true);
        }

        try {
            var offset = heap[16] === 145 ? 17 : 18;
            var buf = new hessian.DecoderV2(heap.slice(offset, heap.length));
            var _ret = buf.read();
            if (_ret instanceof Error || offset === 18) {
                q.reject({
                    code: '108',
                    error: ERROR['108'] + (_ret.message || _ret)
                }); //108 hessian read error
            }
            q.resolve(_ret);
        } catch (e) {
            q.reject({
                code: '109',
                error: ERROR['109'] + (e.message || e)
            }); //109 hessian decoder error
        }

    });

    client.on('timeout', function() {
        client.destroy();
        console.log('socket  timeout');
    });

    return q.promise;
};

SocketClient.prototype._createBuffer = function(service, method, version, args) {
    var typeRef, types, type, buffer;

    typeRef = {
        boolean: 'Z',
        int: 'I',
        short: 'S',
        long: 'J',
        double: 'D',
        float: 'F'
    };

    if (args && args.length) {
        for (var i = 0, l = args.length; i < l; i++) {
            type = args[i]['$class'];
            types += type && ~type.indexOf('.') ? 'L' + type.replace(/\./gi, '/') + ';' : typeRef[type];
        }
        buffer = this.buffer(service, method, version, types, args);
    } else {
        buffer = this.buffer(method, '');
    }

    return buffer;
};

SocketClient.prototype.buffer = function(service, method, version, type, args) {
    var bufferBody = this.bufferBody(service, method, version, type, args);
    var bufferHead = this.bufferHead(bufferBody.length);
    return Buffer.concat([bufferHead, bufferBody]);
};

SocketClient.prototype.bufferHead = function(length) {
    var head = [0xda, 0xbb, 0xc2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var i = 15;

    if (length > DEFAULT_LEN) {
        throw new Error(`Data length too large: ${length}, max payload: ${DEFAULT_LEN}`);
    }
    // 构造body长度信息
    if (length - 256 < 0) {
        head.splice(i, 1, length - 256);
    } else {
        while (length - 256 > 0) {
            head.splice(i--, 1, length % 256);
            length = length >> 8;
        }
        head.splice(i, 1, length);
    }
    return new Buffer(head);
};

SocketClient.prototype.bufferBody = function(service, method, version, type, args) {
    var encoder = new hessian.EncoderV2();
    encoder.write(this._dubboVersion);
    encoder.write(service);
    encoder.write(version);
    encoder.write(method);
    encoder.write(type);

    if (args && args.length) {
        for (var i = 0, len = args.length; i < len; ++i) {
            encoder.write(args[i]);
        }
    }

    encoder.write({
        $class: 'java.util.HashMap',
        $: {
            interface: service,
            version: version,
            group: this._group,
            path: service,
            timeout: '60000'
        }
    });

    encoder = encoder.byteBuffer._bytes.slice(0, encoder.byteBuffer._offset);
    return encoder;
};

module.exports = new SocketClient();
