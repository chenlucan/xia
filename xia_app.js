var fm     = require('./filemanager.js');
var pantry_nedb = require('./pantry_nedb.js');

console.log('app home: ', path.dirname(nw.App.dataPath));
var data_home   = path.join(path.dirname(nw.App.dataPath), 'pantry');
var photos_home = path.join(data_home, 'photos');
var db_home     = path.join(data_home, 'db');

var fileMgr = new fm.FileManager(data_home, function(){}, function(){});
var db = new pantry_nedb.Pantry(db_home);

module.exports.xiaApp = {
  db: db,
  fileMgr: fileMgr
};
