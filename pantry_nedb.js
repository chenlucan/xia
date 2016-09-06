var Datastore = require('nedb');
var path = require('path');

/*
file:
  - id_name : original name + md5(8 digit)
  - id_dir  : pantry location
  - id_path : id_dir+id_name
	- name
	- path
	- ext
	- type
	- md5
	- birth_time
	- modify_time
	- change_time
*/
var Pantry = function (db_home) {
	var pantry_ = path.join(db_home, 'pantry.nedb');
	var db_ = new Datastore({filename: pantry_, autoload: true});

	this.Remove    = Remove;
	this.SaveFile  = SaveFile;
	this.GetAll    = GetAll;
	this.GetByDate = GetByDate;
	this.GetByType = GetByType;
	this.GetByOneDay = GetByOneDay;

	SetUpIndex();

	function Remove(file_id_path) {
		db_.remove({ _id: file_id_path }, {}, function (err, numRemoved) {});
	}

	function SaveFile(file) {
		file['_id'] = file['id_path']
		db_.insert(file, function(err, doc) {});
	}

	function GetAll(on_file_records) {
		db_.find({}, function (err, docs) {
			if (!err) {
				on_file_records(docs);
			}
		});
	}

	function GetByDate(iso_date, on_file_records) {
		db_.find({ birth_time: iso_date }).sort({ birth_time: -1 }).exec(function (err, docs) {
			if (!err) {
				on_file_records(docs);
			}
		});
	}

	function GetByOneDay(iso_day, on_file_records) {
		console.log('==========get by one day=', iso_day);
		db_.find({ birth_time: { $regex: /2016/ } }).sort({ birth_time: -1 }).exec(function (err, docs) {
			if (!err) {
				on_file_records(docs);
			}
		});
	}

	function GetByType(type_name, on_file_records) {
		db_.find({ type: type_name }).sort({ birth_time: -1 }).exec(function (err, docs) {
			if (!err) {
				on_file_records(docs);
			}
		});
	}

	function SetUpIndex() {
		db_.ensureIndex({fieldName: 'birth_time'}, function(err) {});
		db_.ensureIndex({fieldName: 'type'},       function(err) {});
	}

}

module.exports.Pantry = Pantry;
