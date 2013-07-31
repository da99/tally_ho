
var _      = require("underscore")._
  , assert = require("assert")
  , One    = require("../lib/tally_ho").Tally_Ho.new()
  , Two    = require("../lib/tally_ho").Tally_Ho.new()
  , Third  = require("../lib/tally_ho").Tally_Ho.new()
;

One.on('one', function (o) {
  o.finish(1);
});

One.on('two', function (o) {
  o.finish(2);
});

One.on('after two', function (o) {
  assert.equal(o.last, 2);
  o.finish(3);
});

describe( 'finish', function () {

  it( 'saves last value', function (done) {
    process.nextTick(function (){
      One.emit('one', function (o) {
        assert.equal(o.last, 1);
      });
      One.emit('two', function (o) {
        assert.equal(o.last, 3);
        done();
      });
    });
  });

  it( 'throws error if called more than once', function () {
    Two.on('finish 2', function (o) {
      o.finish(1);
      o.finish(2);
    });

    Two.on('finish 2', function (o) { });

    var err = null

    try {
      Two.emit('finish 2');
    } catch (e) {
      err = e;
    }

    assert.equal(err.message.indexOf(".finish called more than once"), 0);
  });

}); // === end desc
