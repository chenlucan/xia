var fd   = require("./filediscover.js");
var hash = require("./filehash.js");
var fs   = require('fs')
var path = require('path');

// file meta-data analyzer
var FileManager = function (data_home, dir_list, on_img, on_movie) {
	var data_home_   = data_home;
	var photos_home_ = path.join(data_home_, 'photos');
	var dir_list_ = dir_list;
	var on_img_   = on_img;
	var on_movie_ = on_movie;
	var hash_     = new hash.FileHash();
	var discovers_ = [];

	this.DiscoverAndImportPath = DiscoverAndImportPath;

	function DiscoverAndImportPath(folderPath) {
		var discover = new fd.FileDiscover([folderPath], ['png','jpg','jpeg'], FoundFiles);
		discovers_.push(discover);
	}

	function FoundFiles(files) {
		console.log("=======here are all found files:", files);
		ImportToDataHome(files);
	}

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

	function ImportToDataHome(file_list) {
		file_list.forEach(function (file, index, array) {
			// compute destination path
			var date_str  = file['birth_time'].substring(0, 10);
			var dest_path = path.join(photos_home_, date_str);
			var dest_file = path.join(dest_path, file['name']);

			fs.access(dest_path, fs.R_OK | fs.W_OK, function(err) {
				if (!err) {
					copyFile(file['path'], dest_file, function(err) {});
				} else {
					fs.mkdir(dest_path, function(err) {
						if (!err) {
							copyFile(file['path'], dest_file, function(err) {});
						}
					});
				}
			});
		});
	}

	function copyFile(source, target, cb) {
		var cbCalled = false;

		var rd = fs.createReadStream(source);
		rd.on("error", function(err) {
			done(err);
		});
		var wr = fs.createWriteStream(target);
		wr.on("error", function(err) {
			done(err);
		});
		wr.on("close", function(ex) {
			done();
		});
		rd.pipe(wr);

		function done(err) {
			if (!cbCalled) {
				cb(err);
				cbCalled = true;
			}
		}
	}
}

module.exports.FileManager = FileManager;
