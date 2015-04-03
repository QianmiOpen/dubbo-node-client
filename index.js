/**
 *
 *
 */
module.exports = {

    /**
     * 配置加载
     */
    config: require('lib/config/index'),

    /**
     * rpc调用, 主要调用入口
     */
    getService: require('lib/rpc/api/invoker/index')
};