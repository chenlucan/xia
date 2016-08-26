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
  var tl_nodes_index_ = [];

  this.AddRecord = AddRecord;

  function AddRecord(record) {
		if (record['type'] === 'photo') {
			var bdate = new Date(record['birth_time']);
			var y = bdate.getFullYear() + '';
			var m = (bdate.getMonth() < 9 ? '0' : '')+(bdate.getMonth()+1); // storting from 0==Jan
			var d = (bdate.getDate()  <= 9 ? '0' : '')+(bdate.getDate()); //starting from 1
			var date_id = y + '年' + m + '月' + d + '日';

      // {id:date_id, img_count:max 4, img_node: html element}
      GetNode(date_id);

      var node = document.body.querySelector('#id-'+date_id);
      var node_content = node.querySelector('.cd-timeline-content');

      var img_ph = document.body.querySelector('#img-placeholder-template');
      var empty_div = img_ph.content.querySelector('.tl_responsive');

      if (tl_nodes_[date_id]['img_count'] >= max_img_count_) {
        empty_div.style.display = "None";
        empty_div.querySelector('img').src = '' ;
      } else {
        empty_div.style.display = "";
        empty_div.querySelector('img').src = 'file:///'+record['id_path'];
      }
      empty_div.querySelector('a').href  = 'file:///'+record['id_path'];
      empty_div.querySelector('a').setAttribute('data-lightbox', date_id);
      empty_div.querySelector('img').alt = record['name'];
      // empty_div.querySelector('.tl_desc').innerHTML   = ""

      var clone = document.importNode(empty_div, true);
      var all_imgs = node_content.getElementsByClassName('tl_responsive');
      node_content.insertBefore(clone, node_content.querySelector('h2'));
      tl_nodes_[date_id]['img_count'] += 1;
		}
  }

  function GetNode(date_id) {
    if (date_id in tl_nodes_) {
      return tl_nodes_[date_id];
    }

    // determine its position
    tl_nodes_index_.push(date_id);
    var c_length = tl_nodes_index_.length;
    tl_nodes_index_ = tl_nodes_index_.sort(function(a,b) { return (a < b); });
    var new_node_index = tl_nodes_index_.indexOf(date_id);
    if (new_node_index === -1) {
      console.log("Error: this element justed pushed, has to be present.");
      return;
    }

    var tl = document.body.querySelector('#cd-timeline');
    var next_node_ref = tl.firstChild;  // assume new_node_index == 0
    var temp_tl = tl;
    if (new_node_index < tl_nodes_index_.length - 1) {
      // new node is not the last oner
      next_node_ref = document.body.querySelector('#id-'+tl_nodes_index_[new_node_index + 1]);
    } else if (new_node_index === tl_nodes_index_.length - 1) {
      next_node_ref = document.body.querySelector('#init-tl-block');
    }

    var t = document.body.querySelector('#img-template');
    var tems = t.content.querySelector('.cd-timeline-block');
    tems.querySelector('h2').innerHTML = "";
    tems.setAttribute('id', 'id-'+date_id);
    var tems_content = tems.querySelector('.cd-timeline-content');
    tems_content.querySelector('.cd-date').innerHTML = date_id;
    var clone = document.importNode(tems, true);

    tl.insertBefore(clone, next_node_ref);
    tl_nodes_[date_id] = {
                      'id':date_id,
                      'img_count': 0,
                      'node':clone,
                      'position': new_node_index,
                   };
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
