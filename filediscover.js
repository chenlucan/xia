"use strict";

var walk  = require('walk'), 
  	path  = require('path');

// on_file(file_ext, abs_path)
var FileDiscover = function(dir_list, type_list, on_file) {
	var dir_list_  = Array.isArray(dir_list) ? dir_list : [];
	var type_list_ = Array.isArray(type_list) ? type_list : ['png', 'jpg', 'jpeg'];
	var on_file_   = on_file;

	exploreAllDirs();
	
	function exploreAllDirs() {
		dir_list_.forEach(function (dir, index, array) {
			var walker = walk.walk(dir, { followLinks: false });

			walker.on("file",        fileHandler);
			walker.on("errors",      errorsHandler);
			walker.on("end",         endHandler);
			walker.on("names",       namesHandler);
			walker.on("directories", directoriesHandler);
		});
	}

	function namesHandler(root, nodeNamesArray) {}

	function directoriesHandler(root, dirStatsArray, next) {
		next();
	}

	function fileHandler(root, fileStat, next) {
		var ext = path.extname(fileStat.name).substring(1);		
		for (var i in type_list_) {
			var type = type_list_[i];
			if (ext.toUpperCase() === type || ext.toLowerCase() === type) {
				var fullname = path.resolve(root, fileStat.name)
				on_file_(ext.toLowerCase(), fullname);
			}
		}
		next();
	}

	function errorsHandler(root, nodeStatsArray, next) {
	  next();
	}

	function endHandler() {}
};

module.exports.FileDiscover = FileDiscover;

