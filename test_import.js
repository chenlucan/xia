var fm = require('./filemanager.js');
var pt = require('./pantry.js');

var filemanager = new fm.FileManager('/home/lucan/Pictures', on_new_file, on_new_file);

// use current for now
var pantry      = new pt.Pantry('./');
pantry.GetAll(on_db_file);

function on_db_file(file) {
	console.log('=================found db file', file);
}

function on_new_file(file) {
	console.log('=================found new file', file);
	Import([file]);
}



var path = require('path');
function Import(file_list) {
	file_list.forEach(function (file, index, array) {
		// compute destination path
		var dest_path = '/home/lucan/photos';
		var date_str  = file['birth_time'].substring(0, 10);
		var dest_path = path.join(dest_path, date_str);

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



var fs = require('fs');
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
