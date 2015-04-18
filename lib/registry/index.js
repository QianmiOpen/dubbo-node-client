var Q = require('../rpc/util/Q'),
    Config = require('../config/index'),
    Cluster = require('../rpc/cluster/index'),
    Zookeeper = require('node-zookeeper-client'),
    _ = require('underscore');
//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
var Registry = function () {
    this.zookeeper = null;
    this.serviceMap = {};
    this.initQueue = [];
};

//-----------------------------------------------------------------------------------------------
// 往zookeeper注册
//-----------------------------------------------------------------------------------------------
Registry.prototype.init = function () {
    var self = this;
    this.isInitializing = true;
    this.zookeeper = Zookeeper.createClient(Config.getRegistryAddress(), Config.getRegistryOption());
    this.zookeeper.once('connected', function () {
        self.initQueue.forEach(function (p) { //从队列中获取, 租个通知
            p.resolve(self.zookeeper);
        });
        self.isInitializing = false;
        console.log('Registry : 已连接上zookeeper');
    });
    this.zookeeper.connect();
};

//-----------------------------------------------------------------------------------------------
// 把invoke注册上来, 当zookeeper刷新
//-----------------------------------------------------------------------------------------------
Registry.prototype.register = function (serviceName, invoker) {
    //
    this.serviceMap[serviceName] = this.serviceMap[serviceName] || [];

    //判断是否已经订阅过
    if (this.serviceMap[serviceName].length == 0) {
        this.serviceMap[serviceName].push(invoker);
        this.subscribe(serviceName)
            .then(function (client) {
                var registryPath = Config.getRegistryPath(serviceName);
                client.create(registryPath, null, Zookeeper.CreateMode.EPHEMERAL, function (err, path) {
                    if (err)
                        console.error('Registry : 注册失败 [' + serviceName + '] [' + err.toString() + ']');
                    else
                        console.log('Registry : 注册成功 [' + serviceName + ']');
                });
            });
    }
};

//-----------------------------------------------------------------------------------------------
// 获取Invoker
//-----------------------------------------------------------------------------------------------
Registry.prototype.getInvoker = function (serviceName) {
    return this.serviceMap[serviceName];
};

//-----------------------------------------------------------------------------------------------
// 获取zookeeper
//-----------------------------------------------------------------------------------------------
Registry.prototype.getZookeeper = function () {
    var defer = Q.defer();
    if (this.zookeeper) {
        defer.resolve(this.zookeeper);
    }
    //如果正在初始化中, 其他就不要初始化了, 加入队列等待
    else if (this.isInitializing) {
        this.initQueue.push(defer.promise);
    }
    return defer.promise;
};

//-----------------------------------------------------------------------------------------------
// 注册之前先订阅信息
//-----------------------------------------------------------------------------------------------
Registry.prototype.subscribe = function (service) {
    var self = this;
    return this.getZookeeper()
        .then(function (client) {
            var defer = Q.defer(),
                path = Config.getSubscribePath(service),
                callee = arguments.callee;
            client.getChildren(path,
                function () {
                    callee();
                },
                function (err, childs) {
                    if (err) {
                        console.error('Registry : 订阅失败 [' + service + '] [' + err.toString() + ']');
                        defer && defer.reject(err.toString());
                    }
                    else if (childs.length > 0) {
                        self.onChangeHandler(service, childs);
                        console.log('Registry : 订阅成功 [' + service + '] 提供者 [' + childs + ']');
                        defer && defer.resolve(client);
                    }
                    else {
                        console.warn('Registry : 尚未发现服务提供者 [' + service + ']');
                    }
                    defer = null;
                });
            return defer.promise;
        })
};

//-----------------------------------------------------------------------------------------------
// 更新
//-----------------------------------------------------------------------------------------------
Registry.prototype.onChangeHandler = function (serviceName, childrens) {
    var self = this,
        hs = [];
    childrens.forEach(function (child) {
        child = decodeURIComponent(child);
        var mHost = /^jsonrpc:\/\/([^\/]+)\//.exec(child),
            mVersion = /version=(.+)/.exec(child),
            mGroup = /group=([^&]+)/.exec(child),
            mMehtod = /methods=([^&]+)/.exec(child);
        if (mHost && mMehtod) {
            hs.push(mHost[1]);
            self.setInvokerMethods(serviceName, mGroup && mGroup[1], mVersion && mVersion[1], mMehtod[1]);
        }
        else {
            console.warn('Registry : 占不支持该提供者 [' + child + ']');
        }
    });
    Cluster.setProvider(serviceName, hs);
};

//-----------------------------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------------------------
Registry.prototype.setInvokerMethods = function (serviceName, group, version, methods) {
    var h = this.serviceMap[serviceName] || h;
    for (var i = 0; i < h.length; i++) {
        var service = h[i];
        if (service.group == group && service.version == version) {
            service.setMethod(methods.split(','));
        }
    }
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = new Registry();