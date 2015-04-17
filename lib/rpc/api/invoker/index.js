var Q = require('q'),
    _ = require('underscore'),
    Cluster = require('../../cluster/index'),
    HttpClient = require('../../util/Http');

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
var time = new Date().getTime(),
    toUrl = function (provider, serivceName) {
        return 'http://' + provider + '/' + serivceName
    },
    toPostData = function (methodName, methodArgs) {
        var postData = {
            "jsonrpc": "2.0",
            "method": methodName,
            "params": methodArgs,
            "id": time--
        };
        return postData;
    },
    Invoker = function (serviceName, group, version) {
        this.serviceName = serviceName;
        this.version = version;
        this.group = group;
    };


//-----------------------------------------------------------------------------------------------
// 对外只有一个方法, 和代理提供的方法
//-----------------------------------------------------------------------------------------------
Invoker.prototype.call = function (methodName) {
    var service = this.serviceName,
        methodArgs = toPostData(methodName, _.toArray(arguments).slice(1)),
        provider = Cluster.getProvider(service),
        url = toUrl(provider, service);
    return HttpClient.post(url, methodArgs)
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = Invoker;