var fs   = require('fs-extra')
var path = require('path');

var fd   = require("./filediscover.js");
var hash = require("./filehash.js");

// file meta-data analyzer
var FileManager = function (data_home, on_img, on_movie) {
	var data_home_   = data_home;
	var photos_home_ = path.join(data_home_, 'photos');
	var on_img_   = on_img;
	var on_movie_ = on_movie;
	var file_imported_ = null;
	var hash_     = new hash.FileHash();
	var discovers_ = [];

	this.DiscoverAndImportPath = DiscoverAndImportPath;

	function DiscoverAndImportPath(folderPath, file_imported) {
		var discover = new fd.FileDiscover(folderPath, ['png','jpg','jpeg'], DiscoveredFile, function(dir_path) { file_imported(); });
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
		CopyToDataHome([file], function(file) {
			file_imported_(file);
		});
	}

  // File and Db index should sycn
  //  - the same key to unique file
	//  - the same attributes
	function ConvertExternalToDbFileRecord(file) {
		if (file.md5.length >= 8) {
			var n = file.name.lastIndexOf(".");
			if (n === -1) {
				return;
			}
			var basename = file.name.substring(0, n);
			var extname  = file.name.substring(n+1);
			file['id_name'] = basename+'_'+file.md5.substring(0, 8)+'.'+extname;
			if (file.type === 'photo') {
				var date_str  = file['birth_time'].substring(0, 10);
				var dest_path = path.join(photos_home_, date_str);
				file['id_dir']  = dest_path;
				file['id_path'] = path.join(dest_path, file['id_name']);
			} else if (file.type === 'movie') {
			}
		}
	}

	function CopyToDataHome(file_list, success_cb) {
		file_list.forEach(function (file, index, array) {
			if (file.id_dir && file.id_path) {
				var dest_path = file.id_dir;
				var dest_file = file.id_path;

				fs.access(dest_path, fs.R_OK | fs.W_OK, function(err) {
					if (!err) {
						fs.copy(file['path'], dest_file, {clobber:true, preserveTimestamps: true}, function (err) {
							if (err) return console.error(err)
							success_cb(file);
						});
					} else {
						fs.mkdir(dest_path, function(err) {
							if (!err) {
								fs.copy(file['path'], dest_file, {clobber:true, preserveTimestamps: true}, function (err) {
									if (err) return console.error(err)
									success_cb(file);
								});
							}
						});
					}
				});
			}
		});
	}
}

module.exports.FileManager = FileManager;
