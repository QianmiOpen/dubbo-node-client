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
    toUrl = function (provider, serviceName) {
        return 'http://' + provider + '/' + serviceName
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
    Invoker = function (invokerDesc) {
        this.invokerDesc = invokerDesc;
    };


//-----------------------------------------------------------------------------------------------
// 对外只有一个方法, 和代理提供的方法
//-----------------------------------------------------------------------------------------------
Invoker.prototype.call = function (methodName) {
    var desc = this.invokerDesc,
        service = desc.serviceName,
        methodArgs = toPostData(methodName, _.toArray(arguments).slice(1));

    return Cluster
        .getProvider(desc)
        .then(function (provider) {
            var url = toUrl(provider, service);
            return HttpClient.post(url, methodArgs)
        });
};

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = Invoker;