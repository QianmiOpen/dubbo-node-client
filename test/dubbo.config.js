module.exports = {

    /**
     *
     */
    application: {
        'application': 'dubbo_node_client',
        'application.version': '1.0',
        'category': 'consumer',
        'dubbo': 'dubbo_node_client_1.0',
        'side': 'consumer',
        'pid': process.pid,
        'version': '1.0'
    },


    /**
     * 注册中心
     */
    registry: '172.16.150.60:2181',

    /**
    *  dubbo config
    */
    dubbo: {
            providerTimeout: 3,
            weight: 1,
            protocol: "dubbo" //添加协议类型，支持rpc调用 默认为jsonrpc, 指定协议则初始化过程中只按照配置协议加载到缓存
    },

    /**
     * 负载均衡规则, 目前只有轮询
     */
    loadbalance: '',

    /**
     * 懒加载, 用于开发阶段, 快速启动
     */
    lazy: false
};