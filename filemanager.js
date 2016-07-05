var fd   = require("./filediscover.js");
var hash = require("./filehash.js");
var fs   = require('fs')
var path = require('path');

// file meta-data analyzer
var FileManager = function (data_home, on_img, on_movie, file_imported) {
	var data_home_   = data_home;
	var photos_home_ = path.join(data_home_, 'photos');
	var on_img_   = on_img;
	var on_movie_ = on_movie;
	var file_imported_ = file_imported;
	var hash_     = new hash.FileHash();
	var discovers_ = [];

	this.DiscoverAndImportPath = DiscoverAndImportPath;

	function DiscoverAndImportPath(folderPath) {
		var discover = new fd.FileDiscover(folderPath, ['png','jpg','jpeg'], DiscoveredFile, DiscoverFinished);
		discovers_.push(discover);
	}

	function DiscoveredFile(file) {
		hash_.md5(file, OnHash);
	}

	function DiscoverFinished(dir_path) {

	}

	function OnHash(file) {
		if (file.ext) {
			if (file.ext === 'jpeg' || file.ext === 'jpg') {
				file['type'] = 'photo';
				on_img_(file);
			} else if (file.ext === 'png') {
				file['type'] = 'photo';
				on_img_(file);
			} else if (file.ext === 'mov') {
				console.log("mov Not supported yet: ", file);
			} else if (file.ext === 'flv') {
				console.log("flv Not supported yet: ", file);
			} else {
				console.log("Not supported data: ", file);
			}
		}
		ConvertExternalToDbFileRecord(file);
		CopyToDataHome([file]);
		file_imported_(file);
	}

  // File and Db index should sycn
  //  - the same key to unique file
	//  - the same attributes
	function ConvertExternalToDbFileRecord(file) {
		if (file.md5.length >= 8) {
			file['id_name'] = file.name+'_'+file.md5.substring(0, 8);
			if (file.type === 'photo') {
				var date_str  = file['birth_time'].substring(0, 10);
				var dest_path = path.join(photos_home_, date_str);
				file['id_dir']  = dest_path;
				file['id_path'] = path.join(dest_path, file['id_name']);
			} else if (file.type === 'movie') {
			}
		}
	}

	function CopyToDataHome(file_list) {
		file_list.forEach(function (file, index, array) {
			if (file.id_dir && file.id_path) {
				var dest_path = file.id_dir;
				var dest_file = file.id_path;

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
			}
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
