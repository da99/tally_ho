
var _        = require("underscore")._
  , assert   = require("assert")
  , Tally_Ho = require("../lib/tally_ho").Tally_Ho.new()
  , Ho       = require("../lib/tally_ho").Tally_Ho.new()
;

Tally_Ho.on_error('not_found', function (o, err) {
  o.data.result.push(err);
});

Tally_Ho.on('subtract', function (o) {
  o.finish('not_found', 1);
});

Tally_Ho.on('raise nested err', function (o) {
  Ho.emit(o, 'nested', {});
});

Ho.on('nested', function (o) {
  o.finish('not_found', 2);
});

describe( '.on_error', function () {

  it( 'runs error handler', function () {
    var o = {result: []};
    Tally_Ho.emit('subtract', o);
    assert.deepEqual( o.result, [1]);
  });

  it( 'catches errors bubbled up from nested flows', function () {
    var o = {result: []};
    Tally_Ho.emit('raise nested err', o);
    assert.deepEqual( o.result, [2]);
  });

}); // === end desc
