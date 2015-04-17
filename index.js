var Config = require('./lib/config/index'),
    Invoker = require('./lib/rpc/api/invoker/index'),
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
    getService: function (serviceName, group, version) {
        var invoker = Registry.getInvoker(serviceName, group, version);
        if (!invoker) {
            invoker = new Invoker(serviceName);
            Registry.register(serviceName, new InvokerProxy(invoker));
        }
        return invoker;
    }
};