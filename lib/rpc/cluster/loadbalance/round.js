var Q = require('q'),
    LoadBalance = require('./index'),
    _ = require('underscore');

//-----------------------------------------------------------------------------------------------
//
//
// 轮询算法
//
//
//-----------------------------------------------------------------------------------------------
var RoundLoadBalance = function () {
};
RoundLoadBalance.prototype = new LoadBalance();

//-----------------------------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------------------------
RoundLoadBalance.prototype.init = function () {
    this.serviceCount = {};
};

//-----------------------------------------------------------------------------------------------
//
//-----------------------------------------------------------------------------------------------
RoundLoadBalance.prototype._getProvider = function (invokerDesc, providerList) {
    //1. 获取调用次数
    var desc = invokerDesc.toString(),
        callCount = this.serviceCount[desc] || -1;

    //2 调用次数加1
    callCount++;

    //3 拿下一个provider
    var index = callCount % providerList.length;

    //4. 设置调用次数
    this.serviceCount[desc] = callCount;

    return providerList[index];
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = RoundLoadBalance;