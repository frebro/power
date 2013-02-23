var PowerApp = {};
// PowerApp.fps = 15;

// function Rect(entity) 
// {
//   this.x = Math.floor(Math.random() * (640 - 30));;
//   this.y = Math.floor(Math.random() * (480 - 30));;
//   this.velocity = Math.random() > 0.5 ? -1 : 1;
 
// };

// Rect.prototype.draw = function(context) 
// {
//   //context.fillRect(this.x, this.y, 30, 30);
// };

// Rect.prototype.update = function() 
// {
//   if (this.y < 0) {
//     this.velocity = 1;
//   } else if (this.y > 450) {
//     this.velocity = -1;
//   }
  
//   this.y += this.velocity;

//   //this.Entity.style.left = this.x;
//   //this.Entity.top = this.y;

//   console.log(this.HTMLElementy);
// //  this.HTMLElement.style.left = 0;
 	

//   console.log('Entity update - Element id')
// };

function hexstr(number) {
    var chars = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
    var low = number & 0xf;
    var high = (number >> 4) & 0xf;
    return "" + chars[high] + chars[low];
}

function rgb2hex(r, g, b) {
    return "#" + hexstr(r) + hexstr(g) + hexstr(b);
}

PowerApp.initialize = function() 
{
	this.MouseX = 0;
	this.MouseY = 0;

	// this.entities = [];
	console.log("PowerApp:Initialize");

	var items = [];



    var cmAttr = 'Map data &copy; 2011 OpenStreetMap contributors, Imagery &copy; 2011 CloudMade',
		cmUrl = 'http://{s}.tile.cloudmade.com/cb142de991d9407c9def8ba0df56ab80/{styleId}/256/{z}/{x}/{y}.png';

 
	var midnight  = L.tileLayer(cmUrl, {styleId: 999,   attribution: cmAttr});

	var map = L.map('map', {
		center: [56.17030,14.86307],
		zoom: 12,
		layers: [midnight],
		scrollWheelZoom: false
	});


	$.getJSON('http://194.47.156.33:8888/lights', function(data) 
	{
	    var items = [];

	    // .lightson .day .time
		// .lightson .night .time

		var totalWatts = data.watts / 1000;
	    var maxWatts = data.max;
	    var minWatts = data.min;

		var minColorRed = 255.0;
		var minColorGreen = 255.0;
		var minColorBlue = 0.0;

		var maxColorRed = 255.0;
		var maxColorGreen = 0.0;
		var maxColorBlue = 0.0;

		var minSize = 50.0;
		var maxSize = 100.0;

		var sunrise = new Date(data.suncycle.rise);
		var sunset =  new Date(data.suncycle.set);
		var currentTime = new Date();

		var currentUsage = sunrise < currentTime ? totalWatts:0;


		$('.lightson .day .time').html(sunrise);
		$('.lightson .night .time').html(sunset);
		$('.status .value').html(currentUsage + " kW");


		$.each(data.lights, function(i, item) 
		{
			var opacity = (item.effect - minWatts)/maxWatts;
			var startRatio = (1.0 - opacity);
			var endRatio = opacity;

			var currentRed = minColorRed * startRatio + maxColorRed * endRatio;
			var currentGreen = minColorGreen * startRatio + maxColorGreen * endRatio;
			var currentBlue = minColorBlue * startRatio + maxColorBlue * endRatio;
			var currentSize =  minSize * startRatio + maxSize * endRatio;

			var color = rgb2hex(currentRed, currentGreen, currentBlue);
		

			var circle = L.circle([item.coordinates.x, item.coordinates.y], currentSize, 
			{
		    	color: 'red',
		    	fillColor: color,
		    	fillOpacity: 0.45 * opacity,
		    	stroke: false

			}).addTo(map);

		

		});
	});
};		

PowerApp.draw = function(interpolation) 
{
	console.log('PowerApp:Draw - ' + interpolation);

};

PowerApp.update = function() 
{
	console.log('PowerApp:Update - ' + this.context + this.MouseX + ',' + this.MouseY);
	for (var i=0; i < this.entities.length; i++) 
	{
    	this.entities[i].update();
	}
};

PowerApp.addEntity = function(entity) 
{
 	var rect = new Rect();
 	rect.HTMLElement = entity;

  	PowerApp.entities.push(rect);

 /* $(entity).animate(
  {
    opacity: '-=0.25',
    top: '+=50',
   // width: ['toggle', 'swing'],
    //height:['toggle', 'swing']
  }, 1000, function() 
  {
    // Animation complete.
  });
  */
}



PowerApp.run = (function() 
{	

	var loops = 0;
	var skipTicks = 1000 / PowerApp.fps;
	var maxFrameSkip = 10;
	var nextGameTick = (new Date).getTime();
	var lastGameTick;

	return function() 
	{
		loops = 0;

		while ((new Date).getTime() > nextGameTick) 
		{
			PowerApp.update();
		    nextGameTick += skipTicks;
			loops++;
		}

	    if (!loops) 
	    {
	      PowerApp.draw((nextGameTick - (new Date).getTime()) / skipTicks);
	    } 
	    else 
	    {
	      PowerApp.draw(0);
	    }
	};
	
})();

PowerApp.parseJSON = function(jsonData) 
{	
	var items = [];
	 
	$.each(data, function(key, val) {
	items.push('<li id="' + key + '">' + val + '</li>');
	});

	$('<ul/>', {
	'class': 'my-new-list',
	html: items.join('')
	}).appendTo('body');
}

$(document).ready(function()
{
	console.log("Start");
	
	

     PowerApp.initialize();
     
	// var onEachFrame = function(cb) 
	// {
	// 	setInterval(cb, 1000 / PowerApp.fps);
	// }       
	// window.onEachFrame = onEachFrame;

 //    window.onEachFrame(PowerApp.run);
});

