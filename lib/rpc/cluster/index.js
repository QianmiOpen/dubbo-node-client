var Q = require('q'),
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
};

//-----------------------------------------------------------------------------------------------
// 删除provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.removeProvider = function (serivceName, providerHost) {
    var h = this.providerMap[serivceName];
    if (h) {
        var i = _.indexOf(h, providerHost);
        h.slice(i, 1);
    }
    return h;
};

//-----------------------------------------------------------------------------------------------
// 新增provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.addProvider = function (serivceName, providerHost) {
    var h = this.providerMap[serivceName];
    h = h || [];
    h.push(providerHost);
    this.providerMap[serivceName] = h;
    return h;
};

//-----------------------------------------------------------------------------------------------
// 设置provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.setProvider = function (serviceName, providerHosts) {
    this.providerMap[serviceName] = providerHosts;
    return this.providerMap[serviceName];
};

//-----------------------------------------------------------------------------------------------
// 获取所有provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getAllProvider = function (serviceName) {
    return this.providerMap[serviceName] || [];
};

//-----------------------------------------------------------------------------------------------
// 获取provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getProvider = function (serviceName) {
    var ps = this.getAllProvider(serviceName);
    if (ps.length <= 1) {
        return ps[0] || '';
    }
    else {
        //这里要用负载均衡算法了... 先不弄了
        return ps[0];
    }
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = new Cluster();