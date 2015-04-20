var _ = require('underscore'),
    dubboClient = require('../index');

//加载配置文件
dubboClient.config(require('./dubbo.config.js'));

////获取serivce
var catQueryProvider = dubboClient.getService('com.qianmi.pc.api.cat.StandardCatQueryProvider', '1.2.3');

setTimeout(function(){
    for(var k in catQueryProvider){
        console.info(k);
    }
}, 1000)

