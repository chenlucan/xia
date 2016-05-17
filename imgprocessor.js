
var gm   = require('gm');
var path = require('path');

var ImgProcessor = function() {
  this.GetThumbnail = GetThumbnail;

  function GetThumbnail(file_path) {
    var dir = path.dirname(file_path);
    gm(file_path)
      .thumbnail(150, 150)
      .write(dir + '/thumbnail.jpg', function(err){
        if (err) return console.dir(arguments)
        console.log(this.outname + " created  ::  " + arguments[3])
      });
  }
}

module.exports.ImgProcessor = ImgProcessor;
