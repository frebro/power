var express = require('express');
var http = require('http');
var fs = require('fs');
var app = express();
var parseString = require('xml2js').parseString;
var resultset = {};
var lights = [];
function onRequest(request, response) {
  response.end();
}

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/alllights', function(req, res){
    res.send(200, resultset);
});

app.get('/lights', function(req, res){
    res.send(200, resultset);
});

app.listen(8888);
console.log("Server has started on port 8888");

//http://194.116.110.159:8280/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json

var options2 = {
    host: 'api.yr.no',
    port: 80,
    path: '/weatherapi/sunrise/1.0/?lat=56.1706;lon=14.86188;date=2013-02-23',
    method: 'GET'
};

var sunreq = http.request(options2, function(res){
    var data = "";
    res.setEncoding('utf8');
    res.on('data', function(chunk){
        data = chunk;
    });

    res.on('end', function(){
        var xml = data;
        parseString(xml, function(err, result){
            var date = result.astrodata.time[0].$;
            //var sunrise = result.astrodata.time[0].location[0].sun[0].$;
            resultset.suncycle = result.astrodata.time[0].location[0].sun[0].$;
            //console.log(sunrise);
            //console.log(result.astrodata.time[0]);
            //console.log(result.astrodata.time[0].location[0].sun[0].$);
        }); 
    })
});

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

        var result = JSON.parse(data);
        var totalwatts = 0;
        var max = 0;
        var min = 9999;

        for(var i=0; i<result.features.length; i++){

            var watt = parseInt( result.features[i].properties.EFFEKT_W );
            var light = {
                    coordinates : {
                        x : result.features[i].geometry.coordinates[1],
                        y : result.features[i].geometry.coordinates[0]
                    },
                    plugged_in : result.features[i].properties.URKOPPLAD,
                    effect: watt
            };
            if(watt > max) max = watt;
            if(watt < min) min = watt;
            if(!isNaN(watt)) totalwatts += watt;

            lights.push(light);
            
        }
        resultset.watts = totalwatts;
        resultset.max = max;
        resultset.min = min;
        resultset.lights = lights;
        
        console.log('Loading done!');
        console.log('Lights loaded: '+i);
        console.log('Total watts loaded: '+totalwatts);
    });
});

req.end();
sunreq.end();
console.log("Request sent!");
