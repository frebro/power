var PowerApp = {};
PowerApp.fps = 15;

function Rect(entity) 
{
  this.x = Math.floor(Math.random() * (640 - 30));;
  this.y = Math.floor(Math.random() * (480 - 30));;
  this.velocity = Math.random() > 0.5 ? -1 : 1;
 
};

Rect.prototype.draw = function(context) 
{
  //context.fillRect(this.x, this.y, 30, 30);
};

Rect.prototype.update = function() 
{
  if (this.y < 0) {
    this.velocity = 1;
  } else if (this.y > 450) {
    this.velocity = -1;
  }
  
  this.y += this.velocity;

  //this.Entity.style.left = this.x;
  //this.Entity.top = this.y;

  console.log(this.HTMLElementy);
//  this.HTMLElement.style.left = 0;
 	

  console.log('Entity update - Element id')
};


PowerApp.initialize = function() 
{
	this.MouseX = 0;
	this.MouseY = 0;

	this.entities = [];
	console.log("PowerApp:Initialize");


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



$(document).ready(function()
{
	console.log("Start");
	

	// $('#start').click(function()
	// {
	// 	Game.isRunning = true;
	// 	console.log('Start clicked!' + Game.isRunning)
	// });

	// $('#stop').click(function()
	// {
	// 	Game.isRunning = false;
	// 	console.log('Stop clicked!' + Game.isRunning)
	// });

	

	var map = L.map('map').setView([56.19524092761848, 14.848571712983098], 13);
	
	L.tileLayer('http://{s}.tile.cloudmade.com/cb142de991d9407c9def8ba0df56ab80/997/256/{z}/{x}/{y}.png', 
	{
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
	    maxZoom: 18
	}).addTo(map);


	var marker = L.marker([56.19524092761848, 14.848571712983098]).addTo(map);
	marker.bindPopup("<b>Standard light pole</b></br>Plugged in: true</br>Effect: 120 W</br>").openPopup();

 //    PowerApp.initialize();
     
	// var onEachFrame = function(cb) 
	// {
	// 	setInterval(cb, 1000 / PowerApp.fps);
	// }       
	// window.onEachFrame = onEachFrame;

 //    window.onEachFrame(PowerApp.run);
});