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
    this.loadbalance = new RandomBalance();
};

//-----------------------------------------------------------------------------------------------
// 删除provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.removeProvider = function (invokeDesc, providerHost) {
    var desc = invokeDesc.toString(),
        h = this.promiseMap[desc];
    if (h) {
        var i = _.indexOf(h, providerHost);
        h.slice(i, 1);
    }
    return h;
};

//-----------------------------------------------------------------------------------------------
// 新增provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.addProvider = function (invokeDesc, providerHost) {
    var desc = invokeDesc.toString(),
        h = this.providerMap[desc] || [];
    h.push(providerHost);
    this.providerMap[desc] = h;
    return h;
};

//-----------------------------------------------------------------------------------------------
// 刷新provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.refreshProvider = function (invokeDesc) {
    //
    var desc = invokeDesc.toString(),
        h = this.providerMap[desc];

    //
    var list = this.promiseMap[desc];
    if (h && list) {
        //移除超时提示
        delete this.providerTimeoutMap[desc];

        //逐个通知
        this.promiseMap[desc] = [];
        for (var i = 0; i < list.length; i++) {
            list[i].resolve(h);
        }
    }
};

//-----------------------------------------------------------------------------------------------
// 获取所有provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getAllProvider = function (invokerDesc) {
    var desc = invokerDesc.toString(),
        q = Q.defer();
    if (this.providerMap[desc]) {
        q.resolve(this.providerMap[desc]);
    }
    else {
        //
        this.promiseMap[desc] = this.promiseMap[desc] || [];
        this.promiseMap[desc].push(q);

        //
        var index = this.promiseMap.length - 1;
        this.providerTimeoutMap[desc] = setTimeout(function () {
            q.reject('获取服务提供者超时 [' + desc + ']');
            this.promiseMap[desc].slice(index, 1);
        }.bind(this), Config.getProviderTimeout());
    }
    return q.promise;
};

//-----------------------------------------------------------------------------------------------
// 获取provider
//-----------------------------------------------------------------------------------------------
Cluster.prototype.getProvider = function (invokerDesc) {
    return this.getAllProvider(invokerDesc).then(function (ps) {
        if (ps.length <= 1) {
            return ps[0] || '';
        }
        else {
            return this.loadbalance.getProvider(invokerDesc, ps);
        }
    }.bind(this));
};

//-----------------------------------------------------------------------------------------------
// 设置provider的权重
//-----------------------------------------------------------------------------------------------
Cluster.prototype.setProviderWeight = function(invokerDesc, providerHost, weight){
    this.loadbalance.setProviderWeight(invokerDesc, providerHost, weight);
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = new Cluster();