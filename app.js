var fm = require('./filemanager.js');

var manager = new fm.FileManager(['/home/lucan/Pictures'], OnImg, OnImg);

function OnImg(img) {
	console.log(img);
};

function OnMovie(mov) {};
