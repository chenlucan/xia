// this module has to be loaded from html script

var RecordManager = function() {
  var records_ = {};

  this.Update = Update;

  function Update(record, OnNewRecord) {
    if (record['id_path'] in records_) {
      return;
    }
    records_[record['id_path']] = record;
    OnNewRecord(record);
  }
};

var TLManager = function() {
  // {id:date_id, img_count:max 4, img_node: html element}
  var max_img_count_ = 4;
  var tl_nodes_ = {};

  this.AddRecord = AddRecord;

  function AddRecord(record) {
		if (record['type'] === 'photo') {
			var bdate = new Date(record['birth_time']);
			var y = bdate.getFullYear() + '';
			var m = (bdate.getMonth() < 9 ? '0' : '')+(bdate.getMonth()+1);
			var d = bdate.getDate();
			var date_id = y + '年' + m + '月' + d + '日';

      if (date_id in tl_nodes_) {
        if (tl_nodes_[date_id]['img_count'] >= max_img_count_) {
          return;
        }
      }

      // {id:date_id, img_count:max 4, img_node: html element}
      GetNode(date_id);
      var node = document.body.querySelector('#id-'+date_id);
      var node_content = node.querySelector('.cd-timeline-content');
      var photos4 = node_content.getElementsByClassName('tl_responsive');
      var empty_div = photos4[tl_nodes_[date_id]['img_count']];
      empty_div.querySelector('a').href  = 'file://'+record['path'];
      empty_div.querySelector('img').src = 'file://'+record['path'];
      empty_div.querySelector('img').alt = record['name'];
      empty_div.querySelector('.tl_desc').innerHTML   = ""

      tl_nodes_[date_id]['img_count'] += 1;
		}
  }

  function GetNode(date_id) {
    if (date_id in tl_nodes_) {
      return tl_nodes_[date_id];
    }

    var t = document.body.querySelector('#img-template');
    var tems = t.content.querySelector('.cd-timeline-block');
    tems.querySelector('h2').innerHTML = "";
    tems.setAttribute('id', 'id-'+date_id);
    var tems_content = tems.querySelector('.cd-timeline-content');
    tems_content.querySelector('.cd-date').innerHTML = date_id;
    var clone = document.importNode(tems, true);
    var tl = document.body.querySelector('#cd-timeline');
    tl.insertBefore(clone, tl.firstChild);
    tl_nodes_[date_id] = {
                      'id':date_id,
                      'img_count': 0,
                      'node':clone
                   };;
    return tl_nodes_[date_id];
  }
}

var UIDelegate = function() {
  var recordMgr_ = new RecordManager();
  var tlMgr_     = new TLManager();

  this.Update = Update;

  function Update(record) {
    recordMgr_.Update(record, OnNewRecord);
  }

  function OnNewRecord(record) {
    tlMgr_.AddRecord(record);
  }

  function AddImageTimePoint(files) {
  }
}
