var through2 = require('through2')

function shuffle (arr) {
  var i
    , j
    , temp

  // Fisher-Yates Shuffle
  for(i=arr.length-1; i>0; --i) {
    j = Math.round(Math.random() * i)
    temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
}

function makeShuffle (opts) {
  var buffer = []
    , batchSize

  opts = opts || {}

  if(!opts.batchSize)
    batchSize = 0
  else
    batchSize = opts.batchSize

  batchSize -= 1

  return through2({objectMode: !!opts.objectMode}, function (chunk, enc, cb) {
    var i
      , ii

    buffer.push(chunk)

    if(batchSize > 0 && buffer.length > batchSize) {
      shuffle(buffer)

      for(i=0, ii=buffer.length; i<ii; ++i)
        this.push(buffer[i])

      buffer = []
    }

    cb()
  }, function (cb) {
    shuffle(buffer)

    for(var i=0, ii=buffer.length; i<ii; ++i)
      this.push(buffer[i])

    cb()
  })
}

module.exports = makeShuffle
