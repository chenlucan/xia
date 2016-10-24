var path   = require('path');
var fs     = require('fs');

var fm     = require('./filemanager.js');
var pantry_nedb = require('./pantry_nedb.js');

console.log('app home: ', path.dirname(nw.App.dataPath));
var data_home   = path.join(path.dirname(nw.App.dataPath), 'pantry');
var photos_home = path.join(data_home, 'photos');
var db_home     = path.join(data_home, 'db');

var callbacks = {
  'on_file_imported': function(file) {
    console.log('File imported by FileManager');
  }
}

var fileMgr = new fm.FileManager(data_home, function(){}, function(){}, callbacks);
var db = new pantry_nedb.Pantry(db_home);

InitializeInstallation();

// only effective for app first time setup
function InitializeInstallation() {
	SetUpPantryDir();

	function SetUpPantryDir() {
		fs.mkdir(data_home, function(err) {
			if (!err) {
				fs.mkdir(photos_home, function(err) {});
				fs.mkdir(db_home, function(err) {});
			}
		});
	}
}

module.exports.xiaApp = {
  db: db,
  fileMgr: fileMgr,
  callbacks: callbacks
};
