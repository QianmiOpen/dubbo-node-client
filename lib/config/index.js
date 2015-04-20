var IP = require('../rpc/util/IP'),
    QS = require('querystring');

//-----------------------------------------------------------------------------------------------
//
//
//  配置项目
//
//
//-----------------------------------------------------------------------------------------------
var Config = function () {
    this.option = null;
    this.ip = IP.getLocalIP();
    this.init();
};

Config.prototype = {

    /**
     *
     */
    init: function () {
    },

    /**
     * 读取配置文件
     * @param path
     */
    load: function (option) {
        this.option = option;
        this.option.dubbo = this.option.dubbo || {
            providerTimeout: 3,
            weight: 1
        };
    },

    /**
     * 获取默认权重
     */
    getDefaultWeight: function(){
        return this.option.dubbo.weight || 0;
    },

    /**
     * 获取注册中心的地址和配置
     */
    getRegistryAddress: function () {
        return this.option.registry;
    },
    getRegistryPath: function (serviceName) {
        this.option.application.interface = serviceName;
        var params = QS.stringify(this.option.application);
        var url = '/dubbo/' + serviceName + '/consumers/' + encodeURIComponent('consumer://' + this.ip + '/' + serviceName + '?') + params;
        return url;
    },
    getSubscribePath: function (serviceName) {
        return '/dubbo/' + serviceName + '/providers';
    },
    getConfiguratorsPath: function(serviceName){
        return '/dubbo/' + serviceName + '/configurators';
    },
    getRegistryOption: function () {
        return {
            sessionTimeout: this.option.registryTimeout || 30 * 1000, //超时
            spinDelay: this.option.registryDelay || 1 * 1000, //延迟
            retries: this.option.registryRetry || 0 //重试次数
        };
    },


    /**
     * 获取Provider超时时间
     */
    getProviderTimeout: function(){
        return this.option.dubbo.providerTimeout * 1000;
    }
};


//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = new Config();