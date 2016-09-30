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

xiaApp.controller('xiaCtrl', function($scope) {
  $scope.appTitle          = i18n.__('app-slogan');
  $scope.btnMore           = i18n.__('More');
  $scope.btnMovePhotosIn   = i18n.__('Move my photos in...');
  $scope.recordYourLife    = i18n.__('Record your life');
  $scope.recordYourLifeDes = i18n.__('Record your life-description');

	$scope.timeline = {};
	$scope.timelineKeys = [];
  $scope.comments = {};

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
      console.log('==============returned records===',records);
			for (var r in records) {
        let id_path = records[r]['id_path']
        $scope.db.GetComments(id_path, function(comments) {
          if (!(id_path in $scope.comments)) {
            $scope.comments[id_path] = [];
          }
          comments.forEach(function(ele, index, array) {
            $scope.comments[id_path].push(ele['comment']);
          });
        });

        $scope.comments[id_path] = [
          {
            'id_path':id_path,
            'comment':'==========='
          },
          {
            'id_path':id_path,
            'comment':'goooooooooooooooo'
          },
          {
            'id_path':id_path,
            'comment':'A nice journey'
          },
        ];

        let template_photo = document.body.querySelector('#photo_with_comments');
        let img_div      = template_photo.content.querySelector('img');
        let comments_div = template_photo.content.querySelector('.comments');
        while (comments_div.firstChild) {
            comments_div.removeChild(comments_div.firstChild);
        }
        $scope.comments[id_path].forEach(function(ele, index, array) {
          console.log();
          let comDiv = document.createElement("div");
          comDiv.innerHTML = ele['comment'];
          comments_div.insertBefore(comDiv, comments_div.childNodes[0]);
        });
        img_div.src='file:///'+id_path;
        let content_div = document.importNode(template_photo.content, true);
        init_items.push(
					{
						src : content_div.children[0],
						type:'inline'
					}
				);
			}

      let all_items = init_items;

			if (all_items.length > 0) {
				$.magnificPopup.open({
						items: all_items,
				    gallery: {
				      enabled: true
				    },
				    type: 'image', // this is a default type

                // mainClass: 'mfp-with-zoom', // this class is for CSS animation below
                // zoom: {
                //   enabled: true, // By default it's false, so don't forget to enable it
                //
                //   duration: 300, // duration of the effect, in milliseconds
                //   easing: 'ease-in-out', // CSS transition easing function
                //
                //   // The "opener" function should return the element from which popup will be zoomed in
                //   // and to which popup will be scaled down
                //   // By defailt it looks for an image tag:
                //   opener: function(openerElement) {
                //     // openerElement is the element on which popup was initialized, in this case its <a> tag
                //     // you don't need to add "opener" option if this code matches your needs, it's defailt one.
                //     return openerElement.is('img') ? openerElement : openerElement.find('img');
                //   }
                // }
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
          //
      		// function InitaDynamicPopup() {
      		// 	$('#open-popup').magnificPopup({
      		// 	    items: [
      		// 	      {
      		// 	        src: 'http://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Peter_%26_Paul_fortress_in_SPB_03.jpg/800px-Peter_%26_Paul_fortress_in_SPB_03.jpg',
      		// 	        title: 'Peter & Paul fortress in SPB'
      		// 	      },
      		// 	      {
      		// 	        src: 'http://vimeo.com/123123',
      		// 	        type: 'iframe' // this overrides default type
      		// 	      },
      		// 	      {
      		// 	        src: $('<div class="white-popup">Dynamically created element</div>'), // Dynamically created element
      		// 	        type: 'inline'
      		// 	      },
      		// 	      {
      		// 	        src: '<div class="white-popup">Popup from HTML string</div>', // HTML string
      		// 	        type: 'inline'
      		// 	      },
      		// 	      {
      		// 	        src: '#my-popup', // CSS selector of an element on page that should be used as a popup
      		// 	        type: 'inline'
      		// 	      }
      		// 	    ],
      		// 	    gallery: {
      		// 	      enabled: true
      		// 	    },
      		// 	    type: 'image' // this is a default type
      		// 	});
      		// }

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
});
