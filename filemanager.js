var fd   = require("./filediscover.js");
var hash = require("./filehash.js");

// file meta-data analyzer
var FileManager = function (dir_list, on_img, on_movie) {
	var dir_list_ = dir_list;
	var on_img_   = on_img;
	var on_movie_ = on_movie;
	var hash_     = new hash.FileHash();

	var discover = new fd.FileDiscover(dir_list_, ['png','jpg','jpeg'], FoundFile);
	function FoundFile(md) {
		if (md.ext) {
			if (md.ext === 'jpeg' || md.ext === 'jpg') {
				md['type'] = 'image';
				hash_.md5(md, OnHash);
			} else if (md.ext === 'png') {
				md['type'] = 'image';
				hash_.md5(md, OnHash);
			} else if (md.ext === 'mov') {
				console.log("mov Not supported yet: ", md);
			} else if (md.ext === 'flv') {
				console.log("flv Not supported yet: ", md);
			} else {
				console.log("Not supported data: ", md);
			}
		}
	}

	function OnHash(md) {
		if (md) {
			if (md.type === "image") {
				on_img_(md);
			} else if (md.type === "movie") {
				on_movie_(md);
			}
		}
	}
}

module.exports.FileManager = FileManager;
