var PowerApp = {};

PowerApp.convertNumberToHexString = function(number)
{
    var chars = new Array(	"0", "1", "2", "3", "4", "5",
    						"6", "7", "8", "9", "a", "b",
    						"c", "d", "e", "f");

    var low = number & 0xf;
    var high = (number >> 4) & 0xf;
    return "" + chars[high] + chars[low];
}

PowerApp.convertRgbToHex = function(r, g, b)
{
    return "#" + PowerApp.convertNumberToHexString(r)
    + PowerApp.convertNumberToHexString(g)
    + PowerApp.convertNumberToHexString(b);
}


PowerApp.initialize = function()
{
	//DEBUG: console.log("PowerApp:Initialize");

	// creds
    var cmAttr = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		cmUrl = 'http://{s}.tile.cloudmade.com/cb142de991d9407c9def8ba0df56ab80/{styleId}/256/{z}/{x}/{y}.png';

	// create a title layer for the map with styleId 999 (midnight map)
	var midnight  = L.tileLayer(cmUrl, {styleId: 999,   attribution: cmAttr});

	// create the map that will be used to visualize the light poles
	var map = L.map('map-canvas', {
		center: [56.17030,14.86307],
		zoom: 12,
		layers: [midnight],
		scrollWheelZoom: false
	});

	// get the usage data from the server, this function also instigates the fetching of light data
	$.getJSON('http://194.116.110.159:8888/currentUsage', function(data)
	{
		//DEBUG: console.log(data);
		var totalWatts = (data.usage.totalwatts / 1000000);
    var maxWatts = data.usage.max;
    var minWatts = data.usage.min;

    var costUnit = data.cost.unit;
    var costValue = data.cost.value;
    var totalCost = costValue*totalWatts;

		var sunrise = new Date(data.suncycle.rise);
		var sunset =  new Date(data.suncycle.set);
		var currentTime = new Date();

		var currentUsage = sunrise < currentTime ? totalCost:0;

		$('.onoff .off .time').html(sunrise);
		$('.onoff .on .time').html(sunset);
		$('.current .cost').html('<i class="icon-money"></i> ' + Math.round(currentUsage) + ' ' + costUnit);


		//  get the light pole data from the server as JSON
		$.getJSON('http://194.116.110.159:8888/lights', function(data)
		{
			// Iterate through all data received from the server
			$.each(data, function(index, light)
			{
				// setup the default colors, sizes and opacity
				var minColorRed = 255.0;
				var minColorGreen = 255.0;
				var minColorBlue = 0.0;

				var maxColorRed = 255.0;
				var maxColorGreen = 0.0;
				var maxColorBlue = 0.0;

				var minSize = 50.0;
				var maxSize = 100.0;
				var defaultOpacity =  0.45;

				// calculate the power ration, where 0==minWatts and 1==maxWatts
				var powerRatio = (light.effect - minWatts)/(maxWatts - minWatts);
				var startRatio = (1.0 - powerRatio);
				var endRatio = powerRatio;

				// mix the min and max colors based on the power ratio
				var currentRed = minColorRed * startRatio + maxColorRed * endRatio;
				var currentGreen = minColorGreen * startRatio + maxColorGreen * endRatio;
				var currentBlue = minColorBlue * startRatio + maxColorBlue * endRatio;

				// calculate the size in between min and max size based on the power ratio
				var currentSize =  minSize * startRatio + maxSize * endRatio;

				// convert the calculated current color to HEX-format
				var color = PowerApp.convertRgbToHex(currentRed, currentGreen, currentBlue);

				// add a circle to the map at the light coordinates, representing the light pole
				var circle = L.circle([light.coordinates.x, light.coordinates.y], currentSize,
				{
			    	color: 'red',
			    	fillColor: color,
			    	fillOpacity: defaultOpacity * powerRatio,
			    	stroke: false

				}).addTo(map);

				// bind a popup to the current light
				circle.bindPopup("<b>Lightpole</b></br>Watts: " + light.effect + " watt");

			});
		});
	});
};

$(document).ready(function()
{
	//DEBUG: console.log("Creating the PowerApp");

    PowerApp.initialize();
});

