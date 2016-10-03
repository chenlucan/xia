var path   = require('path');
var fs     = require('fs');

var fm     = require('./filemanager.js');
var pantry_nedb = require('./pantry_nedb.js');

var i18n = require("i18n");

i18n.configure({
    locales:['en', 'cn'],
    defaultLocale: 'en',
    directory:'./locales'
});

var local = 'en';
var lang = window.navigator.language;
if (lang === 'zh-CN' || lang === 'zh-TW') {
  local = 'cn';
}
i18n.setLocale(local);

console.log("==================language===",window.navigator.language);

var xiaApp = angular.module('xia', []);
xiaApp.config(['$compileProvider',
	function($compileProvider) {
	  // $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
	  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file:chrome-extension):/);
	}]);

xiaApp.controller('xiaCtrl', ['$scope', '$compile', function($scope, $compile) {
  $scope.appTitle          = i18n.__('app-slogan');
  $scope.btnMore           = i18n.__('More');
  $scope.btnMovePhotosIn   = i18n.__('Move my photos in...');
  $scope.recordYourLife    = i18n.__('Record your life');
  $scope.recordYourLifeDes = i18n.__('Record your life-description');

	$scope.timeline = {};
	$scope.timelineKeys = [];
  $scope.comments = {};

  $scope.newPost = {
    'post':''
  };
  $scope.postComment = postComments;
  $scope.deleteComment = deleteComment;
  $scope.popupNodes = [];

	// we use pantry as our data home
	console.log('app home: ', path.dirname(nw.App.dataPath));
	var data_home   = path.join(path.dirname(nw.App.dataPath), 'pantry');
	var photos_home = path.join(data_home, 'photos');
	var db_home     = path.join(data_home, 'db');
	var records_by_date = {};

	InitializeInstallation();

	var db = new pantry_nedb.Pantry(db_home);
	$scope.db = db;
	db.GetAll(OnDBRecords);

	var fileMgr = new fm.FileManager(data_home, function(){}, function(){}, FileImported);

	$scope.Popup = Popup;

	function Popup(btime) {
		// (todo) - btime is from ui, it's supposed local timezone, we used it as iso-date
		var iso_btime = btime.replace(/\//g, '-');

		$scope.db.GetByOneDay(iso_btime, function(records) {
			let init_items = [];
      $scope.popupNodes = []
			for (var r in records) {
        let id_path = records[r]['id_path'];
        $scope.popupNodes.push(
          {
            'id_path':id_path,
            'comments':[]
          }
        );

        $scope.db.GetComments(id_path, function(comments) {
          for (var i in $scope.popupNodes) {
            if ($scope.popupNodes[i].id_path === id_path) {
               $scope.popupNodes[i].comments = [
                 {
                   id: 2,
                   comment:'ccc',
                   creation_time: new Date(),
                   id_path: 'path2'
                 },
                 { id: 4,
                   comment:'dddddd',
                   creation_time: new Date(),
                   id_path: 'path4'
                 },
                 ];
               break; //Stop this loop, we found it!
            }
          }
          $scope.$apply();
        });
			}

      $scope.$apply();
      let all_items = init_items;
      let popupNodeList = document.body.querySelector(".popup-node-list");
      let children = Array.from(popupNodeList.children);
      children.forEach(function(ele, index, array) {
        all_items.push(
          {
            src:ele,
            type:'inline'
          }
        );
      });

			if (all_items.length > 0) {
				$.magnificPopup.open({
						items: all_items,
				    gallery: {
				      enabled: true
				    },
				    type: 'image', // this is a default type

            callbacks : {
              change: function() {
              },
              open : function() {
              },
              elementParse: function(item) {
              }
            }
				});
			}
		});
	}

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
			var bdate = new Date(record['birth_time']);
			var y = bdate.getFullYear() + '';
			var m = (bdate.getMonth() < 9 ? '0' : '')+(bdate.getMonth()+1); // storting from 0==Jan
			var d = (bdate.getDate()  <= 9 ? '0' : '')+(bdate.getDate()); //starting from 1
			var date_id = y + '/' + m + '/' + d;

			// new Date('2016/07/08') use local timezone
			// new Date('2016-07-08') is ISO date
			if (date_id in $scope.timeline) {
				$scope.timeline[date_id].push(record);
			} else {
				$scope.timeline[date_id] = [record];
			}
			$scope.timelineKeys = Object.keys($scope.timeline).sort().reverse();
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

  function postComments(id_path) {
    let new_post = {
      // 'id':auto generated, incremental
      'id_path': id_path,
      'comment': $scope.newPost.comment,
      'creation_time': new Date()
    };
    console.log('========newPost==',$scope.newPost.comment);
    $scope.db.SaveComments(new_post);
  }

  function deleteComment(id) {
    console.log('===========deleteComment==',id);
  }
}]);
