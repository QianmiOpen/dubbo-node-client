var _ = require('underscore'),
    dubboClient = require('../index');

//加载配置文件
dubboClient.config(require('./dubbo.config.js'));

////获取serivce
var userProvider = dubboClient.getService('com.ofpay.demo.api.UserProvider');

//
userProvider.call('queryAll')
    .then(function (ddd) {
        console.log(ddd);
    });
