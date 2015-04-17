var _ = require('underscore');
//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
var InvokerProxy = function (invoker) {
    this.invoke = invoker;
    this.group = invoker.group;
    this.version = invoker.version;
};

//-----------------------------------------------------------------------------------------------
// 当zookeeper通知, 刷新一下, 获取改provider的所有方法
//-----------------------------------------------------------------------------------------------
InvokerProxy.prototype.setMethod = function (methods) {
    for (var i = 0; i < methods.length; i++) {
        var method = methods[i];
        console.log('InvokerProxy : 提供者 [' + this.invoke.serviceName + '] 方法 [' + method + ']');
        this.invoke[method] = this.proxyCall(method)
    }
};

//-----------------------------------------------------------------------------------------------
// 代理, 主要还是调用Invoker的call方法
//-----------------------------------------------------------------------------------------------
InvokerProxy.prototype.proxyCall = function (methodName) {
    return function () {
        var args = [methodName].concat(_.toArray(arguments));
        return this.call.apply(this, args);
    };
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = InvokerProxy;