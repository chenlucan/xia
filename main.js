jQuery(document).ready(function($){
	var timelineBlocks = $('.cd-timeline-block'),
		offset = 0.8;

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

	function createTimePoint(record) {
		if (record['type'] = 'image') {
			createImagePoint(record);
		} else if (record['type'] = 'movie') {
			createMoviePoint(record);
		} else {
			console.log('time record is not supported: ', record);
		}
	}



	// it use Default as data home
	console.log('default data home: ', nw.App.dataPath);
	var path = require('path');
	// we use pantry as our data home
	console.log('app home: ', path.dirname(nw.App.dataPath));

	var data_home = path.join(path.dirname(nw.App.dataPath), 'pantry');

	var photos_home = path.join(data_home, 'photos');
	var db_home     = path.join(data_home, 'db');

	console.log('our data home: ', data_home);

	var fs = require('fs');
	SetUpPantry();

	function SetUpPantry() {
		fs.mkdir(data_home, function(err) {
			if (!err) {
				fs.mkdir(photos_home, function(err) {});
				fs.mkdir(db_home, function(err) {});
			}
		});
	}

	var fm = require('./filemanager.js');
	var filemanager = new fm.FileManager(['/Users/lucan/Documents/backup-20160330'], OnFile, OnFile);
	function OnFile(file) {
		console.log('============OnFile');
		var bdate = new Date(file['birth_time']);
		var y = bdate.getFullYear() + '';
		var m = (bdate.getMonth() < 9 ? '0' : '')+(bdate.getMonth()+1);
		var d = bdate.getDate();
		var k = y + '' + m + '' + d;
		if (!(k in records_by_date)) {
			records_by_date[k] = [file];
			console.log('record key=========', k);
		} else {
			records_by_date[k].push(file);
			console.log('date length=========', k, '====', records_by_date[k].length);
			if (records_by_date[k].length === 4) {
				AddImageTimePoint(records_by_date[k]);
			}
		}

	}

	var pantry = require('./pantry.js');
	var db = new pantry.Pantry(db_home);
	var records_by_date = {};
	db.GetAll(OnRecord);

	function OnRecord(record) {
		if (record['type'] === 'image') {
			// var bdate = new Date(record['birth_time']);
			// var y = bdate.getFullYear();
			// var m = bdate.getMonth() + 1;
			// var d = bdate.getDate();
			// var k = y + '' + m + '' + d;
			// if (!(k in records_by_date)) {
			// 	records_by_date[k] = [];
			// 	console.log('record key=========', k);
			// } else {
			// 	records_by_date[k].append(file);
			// 	console.log('date length=========', k, '====', records_by_date[k].lenth);
			// }
		}
	}

function AddImageTimePoint(files) {
	var t = document.querySelector('#img-template');
	console.log('====================', t);
	var tems = t.content.querySelector('.cd-timeline-content');
	console.log('======================',tems);
	tems.querySelector('h2').innerHTML = "National reserve park";
	var imgs = tems.getElementsByClassName('tl_responsive');
	console.log('=================',imgs);

	imgs[0].querySelector('a').href  = 'file:////'+files[0]['path'];
	imgs[0].querySelector('img').src = 'file:////'+files[0]['path'];
	imgs[0].querySelector('img').alt = files[0]['name'];
	imgs[0].querySelector('.tl_desc').innerHTML   = "First image of the day"

	imgs[1].querySelector('a').href  = 'file:////'+files[1]['path'];
	imgs[1].querySelector('img').src = 'file:////'+files[1]['path'];
	imgs[1].querySelector('img').alt = files[1]['name'];
	imgs[1].querySelector('.tl_desc').innerHTML   = "2nd image of the day"

	imgs[2].querySelector('a').href  = 'file:////'+files[2]['path'];
	imgs[2].querySelector('img').src = 'file:////'+files[2]['path'];
	imgs[2].querySelector('img').alt = files[2]['name'];
	imgs[2].querySelector('.tl_desc').innerHTML   = "3rd image of the day"

	imgs[3].querySelector('a').href  = 'file:////'+files[3]['path'];
	imgs[3].querySelector('img').src = 'file:////'+files[3]['path'];
	imgs[3].querySelector('img').alt = files[3]['name'];
	imgs[3].querySelector('.tl_desc').innerHTML   = "4th image of the day"

	var clone = document.importNode(t.content, true);
	var tl = document.body.querySelector('#cd-timeline');

  tl.insertBefore(clone, tl.firstChild);
}
});
