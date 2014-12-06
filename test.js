var shuffle = require('./')
  , Readable = require('stream').Readable
  , through = require('through2')
  , test = require('tape')

// Two assertions, when this happens correctly
function assertShuffled(t, expected, shuffled) {
  t.equal(shuffled.length, expected.length, 'shuffled length should match expected length')

  var i
    , ii
    , inorder = true
    , index
    , temp = []

  for(i=0, ii=expected.length; i<ii; ++i) {
    temp.push(JSON.stringify(expected[i]))
  }

  expected = temp

  for(i=0, ii=shuffled.length; i<ii; ++i) {
    var castShuffled = JSON.stringify(Buffer.isBuffer(shuffled[i]) ? shuffled[i].toString() : shuffled[i])

    index = expected.indexOf(castShuffled)

    if(index != i)
      inorder = false

    if(index > -1) {
      expected.splice(index, 1)
    }
    else {
      t.fail(castShuffled + ' appeared more than once or not at all')
    }
  }

  t.ok(!inorder, 'should be shuffled')
}

test('shuffle entire input', function (t) {
  t.plan(2)

  var input = new Readable
    , shouldBeSilent = true
    , output = []

  input._read = function () {}

  input.pipe(shuffle()).pipe(through(function (chunk, enc, cb) {
    if(shouldBeSilent)
      t.fail('something was emitted', 'should be silent')

    output.push(chunk)

    cb()
  }, function (cb) {

    assertShuffled(t, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], output)

    cb()
  }))

  input.push('0')
  input.push('1')
  input.push('2')
  input.push('3')
  input.push('4')
  input.push('5')
  input.push('6')
  input.push('7')
  input.push('8')
  input.push('9')

  shouldBeSilent = false

  input.push(null)
})

test('shuffle in batches', function (t) {
  t.plan(2)

  var input = new Readable
    , shouldBeSilent = true
    , output = []

  input._read = function () {}

  input.pipe(shuffle({batchSize: 6})).pipe(through(function (chunk, enc, cb) {
    if(shouldBeSilent)
      t.fail('something was emitted when we should be silent')

    output.push(chunk)

    if(output.length == 6) {
      assertShuffled(t, ['0', '1', '2', '3', '4', '5'], output)
      shouldBeSilent = true
    }

    cb()
  }, function (cb) {

    assertShuffled(t, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], output)

    cb()
  }))

  input.push('0')
  input.push('1')
  input.push('2')
  input.push('3')
  input.push('4')

  shouldBeSilent = false
  input.push('5')
})

test('shuffle objects', function (t) {
  t.plan(2)

  var input = new Readable({objectMode: true})
    , output = []
    , expected = [
                  {apple: 'pie'}
                , {orange: 'juice'}
                , {smoked: 'salmon'}
                , {tuna: 'sandwich'}
                , {chocolate: 'doughnut'}
                , {turkey: 'shuffing'}
                , {coffee: 'grounds'}
                , {itallian: 'wedding'}
                , {french: 'bread'}
                , {creme: 'fraiche'}
                ]

  input._read = function () {}

  input.pipe(shuffle({objectMode: true})).pipe(through.obj(function (chunk, enc, cb) {
    output.push(chunk)
    cb()
  }, function (cb) {
    assertShuffled(t, expected, output)
    cb()
  }))

  for(var i=0, ii=expected.length; i<ii; ++i)
    input.push(expected[i])

  input.push(null)
})
