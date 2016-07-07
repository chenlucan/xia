"use strict";

var walk  = require('walk'),
  	path  = require('path');

// on_file(file_object)
// on_finished(dir_path)
var FileDiscover = function(dir_path, type_list, on_file, on_finished) {
  var dir_path_    = dir_path;
	var type_list_   = Array.isArray(type_list) ? type_list : ['png', 'jpg', 'jpeg'];
	var on_file_     = on_file;
  var on_finished_ = on_finished;
  var found_files_ = [];
  var walker_      = null;

	exploreAllDirs();

	function exploreAllDirs() {
		walker_ = walk.walk(dir_path_, { followLinks: false });

		// all events are here
		// All single event callbacks are in the form of function (root, stat, next) {}.
		// All multiple event callbacks callbacks are in the form of function (root, stats, next) {}, except names which is an array of strings.
		// All error event callbacks are in the form function (root, stat/stats, next) {}. stat.error contains the error.

		walker_.on("names",          namesHandler);
		walker_.on("directory",      directoryHandler);
		walker_.on("directories",    directoriesHandler);
		walker_.on("file",           fileHandler);
		walker_.on("files",          filesHandler);
		walker_.on("end",            endHandler);
		walker_.on("nodeError",      nodeErrorHandler);      //(stat failed)
		walker_.on("directoryError", directoryErrorHandler); // (stat succedded, but readdir failed)
		walker_.on("errors",         errorsHandler);         //(a collection of any errors encountered)
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

				if (stat.birthtime && stat.birthtime < stat.mtime) {
					// linux does not return this attribute
					md['birth_time']  = stat.birthtime.toISOString();
				} else {
					md['birth_time']  = stat.mtime.toISOString();
				}

				// time object
        // ctime is the inode or file change time
        // mtime is the file modify time.
        // atime is the file access time.
				md['access_time'] = stat.atime.toISOString();
				md['modify_time'] = stat.mtime.toISOString();
				md['change_time'] = stat.ctime.toISOString();
				found_files_.push(md);
        on_file_(md);
			}
		}
		next();
	}

	function filesHandler(root, stats, next) {
		next();
	}

	function endHandler() {
    on_finished_(dir_path_);
  }

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
