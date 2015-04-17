var Q = require('q'),
    Request = require('request');

//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
var HttpClient = function () {
};

HttpClient.prototype = {
    get: function () {
        return HttpClient.get.apply(this, arguments);
    },
    post: function () {
        return HttpClient.post.apply(this, arguments);
    }
};

//-----------------------------------------------------------------------------------------------
// Get请求
//-----------------------------------------------------------------------------------------------
HttpClient.get = function () {
};

//-----------------------------------------------------------------------------------------------
// Post请求
//-----------------------------------------------------------------------------------------------
HttpClient.post = function (url, data) {
    var q = Q.defer();
    Request({
        proxy: 'http://127.0.0.1:8088',
        url: url,
        method: 'post',
        form: JSON.stringify(data),
        headers: {
            "Content-type": "application/json-rpc",
            "Accept": "text/json"
        }
    }, function (err, response, body) {
        if (err) {
            q.reject(err.toString());
        }
        else {
            body = JSON.parse(body)
            q.resolve(body.result);
        }
    });
    return q.promise;
};


//-----------------------------------------------------------------------------------------------
//
//
//
//
//
//-----------------------------------------------------------------------------------------------
module.exports = HttpClient;