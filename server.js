//REQUIREMENTS
var express = require('express');
var http = require('http');
var fs = require('fs');
var app = express();
var parseString = require('xml2js').parseString;
var $ = require('jquery');
var mongojs = require('mongojs');
var cronJob = require('cron').CronJob;

//Global Variables
var resultset = {};
var lights = [];
var usage_results = {};

var USER_LOCATION = {
    lat: '56.1706',
    lon: '14.86188',
    date: '2013-02-28'
};


//username:password@localhost/mydb
var DB_CONN = {
    url: 'localhost/power',
    collections: ['log']
};

var db = mongojs(DB_CONN.url, DB_CONN.collections);

//URL to GeoServer. WARNING: This is stil temporary and has to be updated.
//http://194.116.110.159:8280/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures=50&outputFormat=json

//Lampposts
var POI_NUM = 1000;
var POI_HOST = '194.116.110.159';
var POI_PORT = 8280;
var POI_PATH = '/geoserver/Belysning/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Belysning:Karlshamn_belysning_armaturer_SWEREF_point&maxFeatures='+POI_NUM+'&outputFormat=json';

//Weather and sunrise/sunset
var SUNSET_HOST = 'api.yr.no';
var SUNSET_PATH = '/weatherapi/sunrise/1.0/?lat='+USER_LOCATION.lat+';lon='+USER_LOCATION.lon+';date='+USER_LOCATION.date+''

function onRequest(request, response) {
  response.end();
}

app.configure(function(){
    app.use('/', express.static(__dirname + '/'));
    app.use('/css', express.static(__dirname + '/css'));
});

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', function(req, res){
    res.send('THA POWER API');
});

app.get('/alllights', function(req, res){
    res.send(200, resultset);
});

app.get('/lights', function(req, res){
    res.send(200, lights);
});

app.get('/currentUsage', function(req, res){
    res.send(200, usage_results);
});

app.get('/usageHistory', function(req, res){
    res.send(400, 'Still in progress');
});

//CRON JOB
//Every 30 minutes: 0,30 * * * *
new cronJob('*/2 * * * *', function(){
    var time = new Date();
    console.log('--CRON JOB-- '+time);
    usage_results.timestamp = time;
    db.log.insert(usage_results);
    getSunCycle();
    getElectricityCost();

}, null, true);




//START SERVER
app.listen(8888);
console.log("Server has started on port 8888");

/**
 * Fetching the current cost for electricity in Karlshamn
 * @return none
 */
function getElectricityCost() {
    $.getJSON('http://secure.expektra.se/development/opendata.svc/spotprice?bidding_area=se4', function(result){
        currentPrice = result.data[0];
        usage_results.cost = currentPrice;
        usage_results.cost.unit = result.unit;
    });
}

getElectricityCost();

/**
 * Fetching the syn cycle from yr.no /weatherapi/sunrise/1.0/?lat=56.1706;lon=14.86188;date=2013-02-23
 * @return none
 */
function getSunCycle() {
    //Req approach
    var options2 = {
        host: SUNSET_HOST,
        port: 80,
        path: SUNSET_PATH,
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
                usage_results.suncycle = result.astrodata.time[0].location[0].sun[0].$;
                //console.log(sunrise);
                //console.log(result.astrodata.time[0]);
                //console.log(result.astrodata.time[0].location[0].sun[0].$);
            }); 
        })
    });
    sunreq.end();
    //AJAX approach
    /*$.ajax({
        url: 'http://api.yr.no/weatherapi/sunrise/1.0/?lat=56.1706;lon=14.86188;date=2013-02-23',
        dataType: 'xml',
        success: function(xml) {
            $(xml).find(location);
            console.log(xml);
        },
        error: function(err) {
            console.log('ERROR: '+err);
        }
    });*/
}

getSunCycle();

function getLights() {
    var options = {
        host: POI_HOST,
        port: 8280,
        path: POI_PATH,
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
            var usage = {
                num_lights: i,
                totalwatts: totalwatts,
                max: max,
                min: min

            };

            usage_results.usage = usage;
            
            console.log('Loading done!');
            console.log('Lights loaded: '+i);
            console.log('Total watts loaded: '+totalwatts);
        });
    });

    req.end();
}

getLights();
