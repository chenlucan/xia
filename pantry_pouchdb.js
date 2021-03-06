var LevelPouchDB = require('pouchdb');
var path = require('path');

var Pantry = function (db_home) {
	var pantry_ = path.join(db_home, 'pantry_storage');
	var db = new LevelPouchDB(pantry_);

	this.SaveFile  = SaveFile;
	this.GetAll    = GetAll;
	this.GetByDate = GetByDate;
	this.GetByType = GetByType;

	SetUpIndex();

	function SaveFile(file) {
		if (file.id_path) {
			file['_id'] = file.id_path;
			db.put(file).then(function (response) {
				// handle response
			}).catch(function (err) {
			});
		}
	}

	function GetAll(on_file_record) {
		db.allDocs({
			include_docs: true,
	  	attachments: true
		}).then(function (results) {
			on_file_records(results);
		}).catch(function (err) {
		  	console.log(err);
		});
	}

	function GetByDate(iso_date, on_file_record) {
		db.query('birth_time_index', {
			include_docs: true,
		  	attachments: true,
		  	startkey: iso_date,
		  	endkey: iso_date+'\uffff'
		}).then(function (results) {
			on_file_records(results);
		}).catch(function (err) {
		  	console.log(err);
		});
	}

	function GetByType(type, on_file_record) {
		db.query('type_index', {
			include_docs: true,
		  	attachments: true,
		  	startkey: type,
		  	endkey: type+'\uffff'
		}).then(function (results) {
			on_file_records(results);
		}).catch(function (err) {
		  	console.log(err);
		});
	}

	function SetUpIndex() {
		var bt_index = createIndex('birth_time_index', function (doc) {
			emit(doc.birth_time);
		});
		var tp_index = createIndex('type_index', function (doc) {
			emit(doc.type);
		});
		db.put(bt_index).then(function (doc) {}).catch(function (err) {});
		db.put(tp_index).then(function (doc) {}).catch(function (err) {});
		db.query(bt_index, {stale: 'update_after'});
		db.query(tp_index, {stale: 'update_after'});
	}

	function createIndex(name, mapFunction) {
		var doc = {
			_id: '_design/' + name,
			views: {}
		};
		doc.views[name] = { map: mapFunction.toString() };
		return doc;
	}
}

module.exports.Pantry = Pantry;
