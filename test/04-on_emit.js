
var _      = require("underscore")._
  , assert = require("assert")
  , TH     = require("../lib/tally_ho").Tally_Ho.new()
  , H      = require("../lib/tally_ho").Tally_Ho.new()
  , Third  = require("../lib/tally_ho").Tally_Ho.new()
;

TH.on('parent emit', function (o) {
  o.data.result.push('parent emit');
  o.finish();
});

TH.on('add', function (o) {
  o.data.result.push('add');
  H.emit(o, 'sub', o.data);
});

H.on('sub', function (o) {
  o.data.result.push('sub');
  H.emit(o, 'div', o.data);
});

H.on('div', function (o) {
  o.data.result.push('div');
  o.finish();
});

describe( 'parent emit', function () {

  it( 'runs function only once', function (done) {
    process.nextTick(function () {
      var o = {result: []};
      TH.emit('add', o, function () {
        assert.deepEqual(o.result, ['parent emit', 'add', 'sub', 'div']);
        done();
      });
    });
  });

}); // === end desc
