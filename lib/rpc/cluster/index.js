var Q = require('q'),
    Config = require('../../config/index'),
    RandomBalance = require('./loadbalance/random'),
    RoundBalance = require('./loadbalance/round'),
    _ = require('underscore');

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
var Cluster = function () {
    this.providerMap = {};
    this.promiseMap = {};
    this.providerTimeoutMap = {};
    this.loadbalance = new RoundBalance();
};

//-----------------------------------------------------------------------------------------------
// 删除provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.removeProvider = function (serviceName, providerHost) {
    var h = this.providerMap[serviceName];
    if (h) {
        var i = _.indexOf(h, providerHost);
        h.slice(i, 1);
    }
    return h;
};

//-----------------------------------------------------------------------------------------------
// 新增provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.addProvider = function (serviceName, providerHost) {
    var h = this.providerMap[serviceName];
    h = h || [];
    h.push(providerHost);
    this.providerMap[serviceName] = h;
    return h;
};

//-----------------------------------------------------------------------------------------------
// 设置provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.setProvider = function (serviceName, providerHosts) {
    this.providerMap[serviceName] = providerHosts;
    var list = this.promiseMap[serviceName];
    if (list) {
        //移除超时提示
        delete this.providerTimeoutMap[serviceName];

        //逐个通知
        this.promiseMap[serviceName] = [];
        for (var i = 0; i < list.length; i++) {
            list[i].resolve(providerHosts);
        }
    }
    return providerHosts;
};

//-----------------------------------------------------------------------------------------------
// 获取所有provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getAllProvider = function (serviceName) {
    var q = Q.defer();
    if (this.providerMap[serviceName]) {
        q.resolve(this.providerMap[serviceName]);
    }
    else {
        //
        this.promiseMap[serviceName] = this.promiseMap[serviceName] || [];
        this.promiseMap[serviceName].push(q);

        //
        var index = this.promiseMap.length - 1;
        this.providerTimeoutMap[serviceName] = setTimeout(function () {
            q.reject('获取服务提供者超时 [' + serviceName + ']');
            this.promiseMap[serviceName].slice(index, 1);
        }.bind(this), Config.getProviderTimeout());
    }
    return q.promise;
};

//-----------------------------------------------------------------------------------------------
// 获取provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getProvider = function (serviceName) {
    return this.getAllProvider(serviceName).then(function (ps) {
        if (ps.length <= 1) {
            return ps[0] || '';
        }
        else {
            return this.loadbalance.getProvider(serviceName, ps);
        }
    })

};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = new Cluster();