
# 如何使用

## 服务提供者
```java
public interface PhoneNoCheckProvider {

    boolean isPhoneNoLimit(Operators operators, String no, String userid);

    boolean isPhone(String no);
}
```

## 消费者

```javascript
//
var dubboClient = require('dubbo-node-client');

//加载配置文件
dubboClient.config('dubbo.config.js');

//获取serivce
var phoneNoCheckService = dubboClient.getService('com.ofpay.ofdc.api.phone.PhoneNoCheckProvider');

//调用方式
phoneNoCheckService.call('isPhone', "13999999999")
    .done(function(result){ //成功
        return this.call('isPhoneNoLimit', "MOBILE", "130000", "A001");
    })
    .catch(function(error){ //失败
    })
    .finally(function(){ //不管成功还是失败
    });
```