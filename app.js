var f1 = require('./filediscover.js');


var fd = f1.FileDiscover(['/Users/lucan/Documents'], ['png','jpg','jpeg'], FoundFile);


function FoundFile(ext, md) {
	console.log(md);
}