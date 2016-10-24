
var fs     = require('fs');

var locales = require('./themes/tl_locales.js').locales;
var xiaApp  = require('./xia_app.js');

console.log("==================language===",window.navigator.language);

var xia_app = xiaApp.xiaApp;

var tl_App = angular.module('tl', []);
tl_App.config(['$compileProvider',
  function($compileProvider) {
  // $compileProvider.imgSrcSanitizationWhitelist(/^\s*((https?|ftp|file|blob|chrome-extension):|data:image\/)/);
  // $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file:chrome-extension):/);
}]);
tl_App.controller('tlCtrl', ['$scope', function($scope) {
  $scope.appTitle          = locales('app-slogan');
  $scope.btnMore           = locales('More');
  $scope.btnMovePhotosIn   = locales('Move my photos in...');
  $scope.recordYourLife    = locales('Record your life');
  $scope.recordYourLifeDes = locales('Record your life-description');

	$scope.timeline = {};
	$scope.timelineKeys = [];
  $scope.popupNodes = []; // nodes for magnific-popup
  // this additioal nested is here to enforce the presence of dot: newComment.comment
  $scope.newComment = {
    'comment':''
  };

  $scope.postComment = postComments;
  $scope.deleteComment = deleteComment;
  $scope.Popup = Popup;

  $scope.xia_app = xia_app;
	$scope.db = xia_app.db;
  $scope.fileMgr = xia_app.fileMgr;
  $scope.xia_app.callbacks['on_file_imported'] = FileImported;

	$scope.db.GetAll(OnDBRecords);

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
      $scope.fileMgr.DiscoverAndImportPath(folderPath);
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
              $scope.popupNodes[i].comments = comments;
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
              setTimeout(function() {
                document.querySelector('.commentBox').focus();
                $('.commentBox').trigger('focus');
                $scope.newComment.comment = '';
                $scope.$applyAsync();
              }, 100);
            },
            open : function() {},
            elementParse: function(item) {}
          }
				});
			}
		});
	}

	// function definitions
	function OnDBRecords(records) {
		records.forEach(function(record, index, arr) {
			fs.stat(record['id_path'], function(err, stats) {
				if (err) {
					console.log('DB file record has error:', err);
					$scope.db.Remove(record['id_path']);
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
		$scope.db.SaveFile(file);
		OnRecords([file]);
	}

  function postComments(id_path) {
    let new_post = {
      // 'id':auto generated, incremental
      'id_path': id_path,
      'comment': $scope.newComment.comment,
      'creation_time': new Date()
    };
    $scope.newComment.comment = '';
    $scope.db.SaveComments(new_post, function(doc) {
      for (var i in $scope.popupNodes) {
        if ($scope.popupNodes[i].id_path === id_path) {
          $scope.popupNodes[i].comments.push(doc);
          break; //Stop this loop, we found it!
        }
      }
      $scope.$applyAsync();
    });
  }

  function deleteComment(commentid) {
    $scope.db.DeleteComments(commentid, function(deletedid) {
      for (var i in $scope.popupNodes) {
        $scope.popupNodes[i].comments = $scope.popupNodes[i].comments.filter(function(el) {
          return el._id !== commentid;
        });
      }
      $scope.$applyAsync();
    });
  }
}]);
