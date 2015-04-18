var Q = require('q'),
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
        this.promiseMap[serviceName] = this.promiseMap[serviceName] || [];
        this.promiseMap[serviceName].push(q);
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