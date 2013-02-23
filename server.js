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

var lights = [];

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

        var light = {};
        var result = JSON.parse(data);
        for(var i=0; i<result.features.length; i++){
            light.coordinates = result.features[i].geometry;
            light.plugged_in = result.features[i].properties.URKOPPLAD;
            light.effect = result.features[i].properties.EFFEKT_W;

            lights.push(light);
        }

        
        console.log(lights);
    });
    
    //console.log(data);
});

req.end();
console.log("Request sent!");