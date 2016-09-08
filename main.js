var path   = require('path');
var fs     = require('fs');

var fm     = require('./filemanager.js');
var pantry_nedb = require('./pantry_nedb.js');


var xiaApp = angular.module('xia', []);
xiaApp.config(['$compileProvider',
	function($compileProvider) {
	  // $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
	  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file:chrome-extension):/);
	}]);

xiaApp.controller('xiaCtrl', function($scope) {
	$scope.timeline = {};
	$scope.timelineKeys = [];

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
	console.log('===========db is: ===',db);

	var fileMgr = new fm.FileManager(data_home, function(){}, function(){}, FileImported);
	var uiDelegate = new UIDelegate();

	$scope.Popup = Popup;

	function Popup(btime) {
		console.log('================birth_time', btime);
		var qdate = new Date(btime);
		var iso_date = qdate.toISOString();
		console.log('================qdate=', qdate);
		console.log('================iso_date=', iso_date);

		$scope.db.GetAll(function (records) {
			console.log('------------------------',records.length);
			var item_list = [];
			for (var r in records) {
				console.log('-------------looping-',r);
				item_list.push(
					{
						src : 'file:///'+records[r]['id_path'],
						title:'first'
					}
				);
			}

			$.magnificPopup.open({
					items: item_list,
			    gallery: {
			      enabled: true
			    },
			    type: 'image' // this is a default type
			});
		})
		// $scope.db.GetByOneDay(iso_date.substring(10), function(records) {
		// 	console.log('found=====records===',records);
		// })
	}

	jQuery(document).ready(function($) {
		IniializeTimeline();
		InitializeEvents();
		// InitializeMagnificPopup();
		// InitaDynamicPopup();
		$('#open-popup').magnificPopup({});

		function InitializeEvents() {
			var button = document.querySelector('#import-button');
			button.addEventListener('click', function () {
				// selectFolderDialog();
				// InitializeMagnificPopup();
				console.log('==========================intialized events');
				// InitaDynamicPopup();
			});
			console.log('==========================intialized events');
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

		function InitaDynamicPopup() {
			console.log('=====================InitaDynamicPopup');
			// db.GetByDate();
			$('#open-popup').magnificPopup({
			    items: [
			      {
			        src: 'http://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Peter_%26_Paul_fortress_in_SPB_03.jpg/800px-Peter_%26_Paul_fortress_in_SPB_03.jpg',
			        title: 'Peter & Paul fortress in SPB'
			      },
			      {
			        src: 'http://vimeo.com/123123',
			        type: 'iframe' // this overrides default type
			      },
			      {
			        src: $('<div class="white-popup">Dynamically created element</div>'), // Dynamically created element
			        type: 'inline'
			      },
			      {
			        src: '<div class="white-popup">Popup from HTML string</div>', // HTML string
			        type: 'inline'
			      },
			      {
			        src: '#my-popup', // CSS selector of an element on page that should be used as a popup
			        type: 'inline'
			      }
			    ],
			    gallery: {
			      enabled: true
			    },
			    type: 'image' // this is a default type
			});
		}
		function InitializeMagnificPopup() {
			console.log('=================InitializeMagnificPopup();');
			$('.with-caption').magnificPopup({
					type: 'image',
					closeBtnInside: false,
					mainClass: 'mfp-with-zoom mfp-img-mobile',

					image: {
						verticalFit: true,
						titleSrc: function(item) {

			        var caption = item.el.attr('title');

			        var pinItURL = "http://pinterest.com/pin/create/button/";

			        // Refer to http://developers.pinterest.com/pin_it/
			        pinItURL += '?url=' + 'http://dimsemenov.com/plugins/magnific-popup/';
			        pinItURL += '&media=' + item.el.attr('href');
			        pinItURL += '&description=' + caption;


			        return caption + ' &middot; <a class="pin-it" href="'+pinItURL+'" target="_blank"><img src="http://assets.pinterest.com/images/pidgets/pin_it_button.png" /></a>';
						}
					},


			    gallery: {
			      enabled: true
			    },



			    callbacks: {
			      open: function() {
			        this.wrap.on('click.pinhandler', '.pin-it', function(e) {

			          // This part of code doesn't work on CodePen, as it blocks window.open
			          // Uncomment it on your production site, it opens a window via JavaScript, instead of new page
			          /*window.open(e.currentTarget.href, "intent", "scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=550,height=420,left=" + (window.screen ? Math.round(screen.width / 2 - 275) : 50) + ",top=" + 100);


			          return false;*/
			        });
			      },
			      beforeClose: function() {
			       //this.wrap.off('click.pinhandler');
			      }
			    }

				});

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
			var date_id = y + '/' + m + '/' + d;
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
