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
	var comments_ = path.join(db_home, 'comments.nedb');
	var db_ = new Datastore({filename: pantry_, autoload: true});
	var db_comments = new Datastore({filename: comments_, autoload: true});

	this.Remove    = Remove;
	this.SaveFile  = SaveFile;
	this.GetAll    = GetAll;
	this.GetByDate = GetByDate;
	this.GetByType = GetByType;
	this.GetByOneDay = GetByOneDay;
	this.GetComments = GetComments;
	this.SaveComments = SaveComments;

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
		var re_iso_day = new RegExp(iso_day);

		db_.find({ birth_time: { $regex: re_iso_day } }).sort({ birth_time: -1 }).exec(function (err, docs) {
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

	function GetComments(idpath, on_comments) {
		db_comments.find({id_path:idpath}).sort({creation_time: 1}).exec(function (err, docs) {
			if (!err) {
				on_comments(docs);
			}
		});
	}

	function SaveComments(comment) {
		/*
			id_path, comment, creation_time
		*/
		console.log('================SaveComments=',comment);
		db_comments.insert(comment, function(err, doc) {});
	}

	function SetUpIndex() {
		db_.ensureIndex({fieldName: 'birth_time'}, function(err) {});
		db_.ensureIndex({fieldName: 'type'},       function(err) {});
	}

}

module.exports.Pantry = Pantry;
