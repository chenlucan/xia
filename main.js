var path   = require('path');
var fs     = require('fs');

var fm     = require('./filemanager.js');
var pantry_nedb = require('./pantry_nedb.js');


var xiaApp = angular.module('xia', []);
xiaApp.config(['$compileProvider',
	function($compileProvider) {
	  $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
	  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file:chrome-extension):/);
	}]);

xiaApp.controller('xiaCtrl', function($scope) {
  $scope.firstName= "John";
  $scope.lastName= "Doe";
	$scope.names = ['atongmu', 'huluwa'];
	$scope.timeline = {};



	// we use pantry as our data home
	console.log('app home: ', path.dirname(nw.App.dataPath));
	var data_home   = path.join(path.dirname(nw.App.dataPath), 'pantry');
	var photos_home = path.join(data_home, 'photos');
	var db_home     = path.join(data_home, 'db');
	var records_by_date = {};

	InitializeInstallation();

	var db = new pantry_nedb.Pantry(db_home);
	db.GetAll(OnDBRecords);

	var fileMgr = new fm.FileManager(data_home, function(){}, function(){}, FileImported);
	var uiDelegate = new UIDelegate();



	jQuery(document).ready(function($) {
		IniializeTimeline();
		InitializeEvents();

		function InitializeEvents() {
			var button = document.querySelector('#import-button');
			button.addEventListener('click', function () {
				selectFolderDialog();
			});
		}

		function selectFolderDialog() {
				var inputField = document.querySelector('#folderSelector');
				inputField.addEventListener('change', function () {
					var folderPath = this.value;
					DiscoverFolrder(folderPath);
				});
				inputField.click();
		}

		function DiscoverFolrder(folderPath) {
			fileMgr.DiscoverAndImportPath(folderPath);
		}

		function IniializeTimeline() {
			var timelineBlocks = $('.cd-timeline-block'), offset = 0.8;

			//hide timeline blocks which are outside the viewport
			hideBlocks(timelineBlocks, offset);

			//on scolling, show/animate timeline blocks when enter the viewport
			$(window).on('scroll', function(){
				(!window.requestAnimationFrame)
					? setTimeout(function(){ showBlocks(timelineBlocks, offset); }, 100)
					: window.requestAnimationFrame(function(){ showBlocks(timelineBlocks, offset); });
			});

			function hideBlocks(blocks, offset) {
				blocks.each(function(){
					( $(this).offset().top > $(window).scrollTop()+$(window).height()*offset ) && $(this).find('.cd-timeline-img, .cd-timeline-content').addClass('is-hidden');
				});
			}

			function showBlocks(blocks, offset) {
				blocks.each(function(){
					( $(this).offset().top <= $(window).scrollTop()+$(window).height()*offset && $(this).find('.cd-timeline-img').hasClass('is-hidden') ) && $(this).find('.cd-timeline-img, .cd-timeline-content').removeClass('is-hidden').addClass('bounce-in');
				});
			}
		}
	});









	// function definitions
	function OnDBRecords(records) {
		records.forEach(function(record, index, arr) {
			fs.stat(record['id_path'], function(err, stats) {
				if (err) {
					console.log('DB file record has error:', err);
					db.Remove(record['id_path']);
					return;
				}
				OnRecords([record]);
			})
		});
	}

	function OnRecords(records) {
		records.forEach(function(record, index, arr) {
			// uiDelegate.Update(record);

			var bdate = new Date(record['birth_time']);
			var y = bdate.getFullYear() + '';
			var m = (bdate.getMonth() < 9 ? '0' : '')+(bdate.getMonth()+1); // storting from 0==Jan
			var d = (bdate.getDate()  <= 9 ? '0' : '')+(bdate.getDate()); //starting from 1
			var date_id = y + '年' + m + '月' + d + '日';
			if (date_id in $scope.timeline) {
				$scope.timeline[date_id].push(record);
			} else {
				$scope.timeline[date_id] = [record];
			}
			// timeline.append(record);
		});
		$scope.$applyAsync();
	}

	function FileImported(file) {
		db.SaveFile(file);
		OnRecords([file]);
	}

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
});
