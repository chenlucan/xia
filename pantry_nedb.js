var Datastore = require('nedb');
var path = require('path');

var Pantry = function (db_home) {
	var pantry_ = path.join(db_home, 'pantry.nedb');
	var db_ = new Datastore({filename: pantry_, autoreload: true});

	this.SaveFile  = SaveFile;
	this.GetAll    = GetAll;
	this.GetByDate = GetByDate;
	this.GetByType = GetByType;

	SetUpIndex();

	function SaveFile(file) {

	}

	function GetAll(on_file_record) {
	}

	function GetByDate(iso_date, on_file_record) {
	}

	function GetByType(type, on_file_record) {
	}

	function SetUpIndex() {
		db_.ensureIndex({fieldName: 'birth_time'}, function(err) {});
		db_.ensureIndex({fieldName: 'type'}, function(err) {});
	}

}

module.exports.Pantry = Pantry;
