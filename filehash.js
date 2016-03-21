var crypto = require('crypto'), 
    fs     = require('fs');

var FileHash = function() {

	this.md5 = md5;

	function md5(md, on_hash) {
		var hash   = crypto.createHash('md5'), 
		    stream = fs.createReadStream(md.path);

		hash.setEncoding('hex');

		stream.on('end', function () {
		    hash.end();
		    md['md5'] = hash.read();
		    on_hash(md);
		});

		stream.pipe(hash)
	}
}

module.exports.FileHash = FileHash;