var Config = require('./lib/config/index'),
    Invoker = require('./lib/rpc/api/invoker/index'),
    InvokerDesc = require('./lib/rpc/api/invoker/desc'),
    InvokerProxy = require('./lib/rpc/api/invoker/proxy'),
    Registry = require('./lib/registry/index');


//-----------------------------------------------------------------------------------------------
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = {

    /**
     * 配置加载
     */
    config: function (path) {
        Config.load(path);
        Registry.init();
    },

    /**
     * rpc调用, 主要调用入口
     */
    getService: function (serviceName, version, group) {
        var invokerDesc = new InvokerDesc(serviceName, group, version),
            invoker = Registry.getInvoker(invokerDesc);
        if (!invoker) {
            invoker = new Invoker(invokerDesc);
            Registry.register(invokerDesc, new InvokerProxy(invoker, invokerDesc));
        }
        return invoker;
    }
};