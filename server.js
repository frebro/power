var express = require('express');
var http = require('http');
var fs = require('fs');
var data = "";

function onRequest(request, response) {
  response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Server has started.");

//http://194.116.110.159:8280/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json

var options = {
    host: '194.116.110.159',
    port: 8280,
    path: '/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=10&outputFormat=json',
    method: 'GET'
};

var req = http.request(options, function(res) {
    var data = "";
    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        data += chunk;
    });

    res.on('end', function() {
        var result = JSON.parse(data);
        console.log( result.features[0].geometry );
    });
    
    //console.log(data);
});

req.end();
console.log("Request sent!");