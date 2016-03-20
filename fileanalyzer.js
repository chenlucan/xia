var fd = require("./filediscover.js");

// file meta-data analyzer
var FileAnalyzer = function (dir_list, on_img, on_movie) {
	var dir_list_ = dir_list;
	var on_img_   = on_img;
	var on_movie_ = on_movie;

	var discover = fd.FileDiscover(dir_list_, ['png','jpg','jpeg'], FoundFile);

	function FoundFile(md) {
		if (md.ext) {
			if (md.ext === 'jpeg' || md.ext === 'jpg') {
				md['type'] = 'image';
			} else if (md.ext === 'png') {
				md['type'] = 'image';
			} else if (md.ext === 'mov') {
				console.log("mov Not supported yet: ", md);
			} else if (md.ext === 'flv') {
				console.log("flv supported yet: ", md);
			} else {
				console.log("Not supported data: ", md);
			}
		}
	}
}

module.exports.FileAnalyzer = FileAnalyzer;