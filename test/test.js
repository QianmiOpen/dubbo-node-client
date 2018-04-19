var _ = require('underscore'),
    dubboClient = require('../index');

//加载配置文件
dubboClient.config(require('./dubbo.config.js'));

////获取serivce
var catQueryProvider = dubboClient.getService('com.lefit.dubbo.coach.api.goods.GoodsSkuService', '1.0');

// dubbo协议方式调用
var data = {
	"$class": "com.lefit.dubbo.coach.api.goods.request.LessonSkuTypeReq",
	"$": {"goodsNo": "01241", "coachId": 120, "userId": 105424}
};
catQueryProvider.callRpc('goodsSkuDetail', data)
    .then(function (r) {
        console.info(r);
        process.exit(0);
    })
    .catch(function (e) {
        console.error(JSON.stringify(e));
        process.exit(0);
    });

//jsonrpc 方式调用
// catQueryProvider.call('goodsSkuDetail', 111)
//     .then(function (r) {
//         console.info(r);
//         process.exit(0);
//     })
//     .catch(function (e) {
//         console.error(JSON.stringify(e));
//         process.exit(0);
//     });


