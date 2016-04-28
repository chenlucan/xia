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

			// all events are here
			// All single event callbacks are in the form of function (root, stat, next) {}.
			// All multiple event callbacks callbacks are in the form of function (root, stats, next) {}, except names which is an array of strings.
			// All error event callbacks are in the form function (root, stat/stats, next) {}. stat.error contains the error.

			walker.on("names",          namesHandler);
			walker.on("directory",      directoryHandler);
			walker.on("directories",    directoriesHandler);
			walker.on("file",           fileHandler);
			walker.on("files",          filesHandler);
			walker.on("end",            endHandler);
			walker.on("nodeError",      nodeErrorHandler);      //(stat failed)
			walker.on("directoryError", directoryErrorHandler); // (stat succedded, but readdir failed)
			walker.on("errors",         errorsHandler);         //(a collection of any errors encountered)
		});
	}

	function namesHandler(root, nodeNamesArray) {}

	function directoryHandler(root, stat, next) {
		next();
	}

	function directoriesHandler(root, stats, next) {
		next();
	}

	function fileHandler(root, stat, next) {
		var ext = path.extname(stat.name).substring(1);		
		for (var i in type_list_) {
			var type = type_list_[i];
			if (ext.toUpperCase() === type || ext.toLowerCase() === type) {
				var full_path = path.resolve(root, stat.name)
				var md = {};
				md['name'] = stat.name;
				md['ext']  = ext.toLowerCase();
				md['path'] = full_path;
				// time object
				md['birth_time']  = stat.birthtime;
				md['access_time'] = stat.atime.toISOString();
				md['modify_time'] = stat.mtime.toISOString();
				md['change_time'] = stat.ctime.toISOString();
				on_file_(md);
			}
		}
		next();
	}

	function filesHandler(root, stats, next) {
		next();
	}

	function endHandler() {}

	function nodeErrorHandler(root, stat, next) {
		next();
	}

	function directoryErrorHandler(root, stat, next) {
		next();
	}

	function errorsHandler(root, nodeStatsArray, next) {
		next();
	}
};

module.exports.FileDiscover = FileDiscover;

