var OS = require('os');

//-----------------------------------------------------------------------------------------------
//
//
//
//
//-----------------------------------------------------------------------------------------------
/**
 * 获取指定网卡的IP
 * @param name 网卡名
 * @param family IP版本 IPv4 or IPv5
 * @returns ip
 */
exports.getLocalIP = function (name) {
    //所有的网卡
    var ifaces = OS.networkInterfaces();

    //移除loopback,没多大意义
    for (var dev in ifaces) {
        if (dev.toLowerCase().indexOf('loopback') != -1 ||  dev.toLowerCase().indexOf('vmware') != -1) {
            delete  ifaces[dev];
        }
    }

    var ip = null;
    var family = 'IPv4'.toLowerCase();

    for (var dev in ifaces) {
        var face = ifaces[dev][0];
        if (face.family.toLowerCase() === family) {
            ip = face.address;
        }
        break;
    }


    if (ip == null) {
        ip = '127.0.0.1';
    }

    return ip;
};
