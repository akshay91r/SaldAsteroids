var mainloop = require('sald:mainloop.js');

sald.size = {x:320, y:240, mode:"ratio"};
sald.scene = require('asteroids.js');

window.main = function main() {
	mainloop.start(document.getElementById("canvas"));
};
