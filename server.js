var express = require('express');
var http = require('http');

function onRequest(request, response) {
  response.end();
}

http.createServer(onRequest).listen(8888);
console.log("Server has started.");

//http://194.116.110.159:8280/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json

var options = {
    host: '194.116.110.159',
    port: 8280,
    path: '/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json',
    method: 'GET',
    dataType: 'json'
    //headers: { "api_key" : "MY API KEY HERE" }
};

var req = http.request(options, function(res) {


    console.log('STATUS: ' + res.statusCode);
    res.setEncoding('utf8');
    res.on('data', function (data) {
    	
    	//console.log(data);
    	var poles = data.features;

    	console.log(data.features);

      //console.log('BODY: ' + test);
        
    });
});

req.end();
console.log("Request sent!");