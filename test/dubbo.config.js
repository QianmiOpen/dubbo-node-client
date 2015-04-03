
module.exports = {

    /**
     * 注册中心
     */
    registry: 'zookeeper://127.0.0.1:2181',

    /**
     * 负载均衡规则, 目前只有轮询
     */
    loadbalance: '',

    /**
     * 懒加载, 用于开发阶段, 快速启动
     */
    lazy: true
};