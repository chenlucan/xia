var gm = require('gm')
  , dir = __dirname + '/imgs'
  , imgs = 'lost.png original.jpeg'.split(' ').map(function (img) {
      return dir + '/' + img
    })
  , out = dir + '/append.jpg'

gm(imgs[0])
.append(imgs[1])
.append()
.background('#222')
.write(out, function (err) {
  if (err) return console.dir(arguments)
  console.log(this.outname + " created  ::  " + arguments[3])
  // require('child_process').exec('open ' + out)
});
