
var TileSize = 32;
var PlayerSpeed = 4.0; //tiles per second

var Tilemap = require('sald:Tilemap.js');
var sprite = require('sald:Sprite.js'); 
var col = require('sald:collide.js');
var GameObject = require('sald:GameObject.js');

var shipImg = require('../img/spaceship.png');
var skyImg = require('../img/sky.png');
var bulletImg = require('../img/bullet.png');
var asteroidImg = require('../img/asteroid.png');

var shipSprite = new sprite(shipImg, 
 	{'idle' : {
	  x:0,y:0,
	  width:100,height:68,
	  size:1 }
	  });

var bullets = [];
var bulletSprite = new sprite(bulletImg, 
 	{'fire' : {
	  x:0,y:0,
	  width:40,height:44.5,
	  size:1 }
	  });

var asteroids = [];
var asteroidSprite = new sprite(asteroidImg, 
 	{'idle' : {
	  x:0,y:0,
	  width:64,height:64,
	  size:1 }
	  });

var bounds = {
	xMin: -4.5,
	xMax: 4.5,
	yMin: -3.35,
	yMax: 3.35,
	};

var bulletSpeed = 0.085;

var mymap=[
[8,8,8,8,8,8,8,8,8,8,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,8,8,8,8,23,8,8,8,8,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,10,10,10,10,8,10,10,10,10,8],
[8,8,8,8,8,8,8,8,8,8,8]
];

tmap=new Tilemap(skyImg,mymap,32,32,8,8,10);

var spacePressed = false;

//camera position (in tiles):
var camera = {
	x: 0,
	y: 0
};

//player position (in tiles):
var player = {
	x: 0,
	y: 0,
	frameAcc: 0.0,
	frame: 0,
};

var x1,y1,x2,y2,x3,y3;
var coin1;

function spawnAsteroids() {
	
	for(var i=0;i<8;i++) {

		var a = {
		x: 5 + Math.random() * 2,
		y: -4 + Math.random() * 8,
		frameAcc: 0.0,
		frame: 0,
		speed: 0.02 + Math.random() * 0.04,
		rotation: 0,
		rotationSpeed: -2 + Math.random() * 4,
		};

		asteroids[asteroids.length] = a;

	}
}

spawnAsteroids();	

function fireBullet(xPos, yPos) {
	
	spacePressed = true;
	
	var b = {
	x: xPos,
	y: yPos,
	frameAcc: 0.0,
	frame: 0,
	};
	
	bullets[bullets.length] = b;
}

function draw() {
	var ctx = window.sald.ctx;
	//First, clear the screen:
	ctx.setTransform(ctx.factor,0, 0,ctx.factor, 0,0);
	ctx.fillStyle = "#f0f"; //bright pink, since this *should* be drawn over

	ctx.fillRect(0, 0, 320, 240); //<--- hardcoded size. bad style!

	//don't interpolate scaled images. Let's see those crisp pixels:
	ctx.imageSmoothingEnabled = false;

	//Now transform into camera space:
	//  (units are tiles, +x is right, +y is up, camera is at the center:
	ctx.setTransform(
		//x direction:
			ctx.factor * TileSize, 0,
		//y direction (sign is negative to make +y up):
			0,-ctx.factor * TileSize,
		//offset (in pixels):
			ctx.factor * (320 / 2 - Math.round(camera.x * TileSize)),
			ctx.factor * (240 / 2 + Math.round(camera.y * TileSize)) //<-- y is added here because of sign flip
		);
	
	//draw tilemap
	tmap.draw(camera);

	//rotAngle += 1;

	camera.x = 0;
	camera.y = 0;
	
	//draw player	
	shipSprite.draw('idle', player.x,player.y,-90,1,1,0.5,0.5);

	//draw all bullets
	for(var i=0;i<bullets.length;i++) {
		bulletSprite.draw('fire',bullets[i].x,bullets[i].y,0,0.7,0.7,0.5,0.5);
	}

	//draw all asteroids
	for(var i=0;i<asteroids.length;i++) {
		asteroids[i].rotation += asteroids[i].rotationSpeed;
		asteroidSprite.draw('idle',asteroids[i].x,asteroids[i].y,asteroids[i].rotation,0.7,0.7,0.5,0.5);
	}

	var playerRect={
		min:{x:player.x,y:player.y},
		max:{x:player.x+(0.5),y:player.y+(0.5)}
	};
	
	//check collisions with all bullets
	for(var i=0;i<bullets.length;i++) 	
	{
		var bulletRect={
				min:{x: bullets[i].x, y: bullets[i].y},
				max:{x: bullets[i].x+0.5, y: bullets[i].y+0.5}
				};

	for(var j=0;j<asteroids.length;j++) 
		{
		
		var asteroidRect={
			min:{x: asteroids[j].x, y: asteroids[j].y},
			max:{x: asteroids[j].x+0.5, y: asteroids[j].y+0.5}
		};

			if (col.rectangleRectangle(asteroidRect, bulletRect)) 
			{	//Check player collision with asteroid
				ctx.strokeStyle = '#fff';
				console.log("Collided with asteroid!!!");
				//destroy bullet
				var bIndex = bullets.indexOf(bullets[i]);
				if(bIndex > -1)  
					bullets.splice(bIndex, 1);

				respawnAsteroid(j);
				
			}
			ctx.stroke();
		}
	}			
			
	//rounded corners:
	ctx.setTransform(ctx.factor,0, 0,ctx.factor, 0,0);
	ctx.fillStyle = "#452267"; //background color of page
	ctx.fillRect(0,0, 1,2);
	ctx.fillRect(1,0, 1,1);

	ctx.fillRect(0,238, 1,2);
	ctx.fillRect(1,239, 1,1);

	ctx.fillRect(319,0, 1,2);
	ctx.fillRect(318,0, 1,1);

	ctx.fillRect(319,238, 1,2);
	ctx.fillRect(318,239, 1,1);
}

function update(elapsed) {
	var command = {
		x:0.0,
		y:0.0
	};
	
	var keys=window.sald.keys;
	//Movement
	if (keys['LEFT'] || keys['A'])command.x -= 1.0;
	if (keys['RIGHT']|| keys['D']) command.x += 1.0;
	if (keys['DOWN'] || keys['S']) command.y -= 1.0;
	if (keys['UP'] || keys['W']) command.y += 1.0;
	if (keys['SPACE'] && !spacePressed) fireBullet(player.x, player.y);

	if(!keys['SPACE']) spacePressed = false;
	
	if (command.x != 0.0 || command.y != 0.0) {
		
		shipSprite.draw('idle', player.x,player.y,0,1,1,0.5,0.5);
		var len = Math.sqrt(command.x * command.x + command.y * command.y);
		command.x /= len;
		command.y /= len;

		player.x += command.x * PlayerSpeed * elapsed;
		player.y += command.y * PlayerSpeed * elapsed;

		player.x = Math.max(player.x, bounds.xMin);
		player.x = Math.min(player.x, bounds.xMax);
		player.y = Math.max(player.y, bounds.yMin);
		player.y = Math.min(player.y, bounds.yMax);

		//alternate player frames 1 and 2 if walking:
		player.frameAcc = (player.frameAcc + (elapsed * PlayerSpeed) / 0.3) % 2; 
		player.frame = 1 + Math.floor(player.frameAcc);
	} 


	//move all bullets
	for(var i=0;i<bullets.length;i++) {
		bullets[i].x += bulletSpeed;
		
		//when bullet goes off screen
		if(bullets[i].x > 5) {
			var index = bullets.indexOf(bullets[i]);
			if(index > -1) {
				bullets.splice(index, 1);
			}
		}
	}

	//move all asteroids
	for(var i=0;i<asteroids.length;i++) {
		asteroids[i].x -= asteroids[i].speed;
		
		//when asteroid goes off screen
		if(asteroids[i].x < -5) {
			respawnAsteroid(i);		
		}
	}
}

function respawnAsteroid(index) {
	asteroids[index].x = 6;
	asteroids[index].y = -4 + Math.random() * 8;
	asteroids[index].speed = 0.02 + Math.random() * 0.04;
	asteroids[index].rotation = 0;
	asteroids[index].rotationSpeed = -2 + Math.random() * 4;
}

function key(key, state) {
	//don't do anything
}

module.exports = {
	draw:draw,
	update:update,
	key:key
};
