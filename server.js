var express = require('express');
var http = require('http');
var fs = require('fs');
var app = express();
var lights = [];
function onRequest(request, response) {
  response.end();
}

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/lights', function(req, res){
    var result = {};
    res.send(200, lights);
});

app.listen(8888);
console.log("Server has started on port 8888");

//http://194.116.110.159:8280/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json



var options = {
    host: '194.116.110.159',
    port: 8280,
    path: '/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=10000&outputFormat=json',
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
            light.coordinates = {
               x : result.features[i].geometry.coordinates[1],
               y : result.features[i].geometry.coordinates[0]
            } 
            light.plugged_in = result.features[i].properties.URKOPPLAD;
            if(light.plugged_in == 'N') {
                light.plugged_in = false;
            } else {
                light.plugged_in = true;
            }
            light.effect = parseFloat( result.features[i].properties.EFFEKT_W );


            lights.push(light);
            
        }
        console.log('Loading done!');
        console.log('Lights loaded: '+i);
    });
    
    //console.log(data);
});

req.end();
console.log("Request sent!");