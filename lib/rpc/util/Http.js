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
        url: url,
        method: 'post',
        form: JSON.stringify(data),
        headers: {
            "Content-type": "application/json-rpc",
            "Accept": "text/json"
        }
    }, function (err, response, body) {
        if (err) {
            q.reject({code: 0, message: 'err.toString()'});
        }
        else {
            body = JSON.parse(body);
            if (body.error) {
                q.reject(body.error);
            }
            else {
                q.resolve(body.result);
            }
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