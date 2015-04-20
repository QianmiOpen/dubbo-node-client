

# 如何安装

[Node.js](http://nodejs.org).

[![NPM](https://nodei.co/npm/dubbo-node-client.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/dubbo-node-client/)

npm install dubbo-node-client

# 注意

<font color=red> 该项目只支持 [jsonrpc协议](https://github.com/ofpay/dubbo-rpc-jsonrpc), 不支持 dubbo协议的服务提供者</font>

---

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
dubboClient.config(require('./dubbo.config.js'));

//获取serivce
var phoneNoCheckService = dubboClient.getService('com.ofpay.ofdc.api.phone.PhoneNoCheckProvider', version, group);

//调用方式一, 这种可以立即调用, 无需延迟
phoneNoCheckService.call('isPhone', "13999999999")
    .then(function(result){ //成功
        return this.call('isPhoneNoLimit', "MOBILE", "130000", "A001");
    })
    .catch(function(error){ //失败
    })
    .finally(function(){ //不管成功还是失败
    });

//调用方式二, 这种需要延迟, 因为provider的方法是由zookeeper的节点提供,
//所以要先查到这个provider的节点, 这个步骤是异步的, 就导致你如果直接调用方法会报错
phoneNoCheckService.isPhone('xxxxx');

//当然如果你是在Express里面调用, 那肯定没有问题.
function doFoo(req, res){
    phoneNoCheckService.isPhone('xxxxx')
            .then(function(out){
                res.send(out);
            });
}

```