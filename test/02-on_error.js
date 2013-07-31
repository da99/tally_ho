
var _    = require("underscore")._,
assert   = require("assert"),
Tally_Ho = require("../lib/tally_ho").Tally_Ho.new()
;

Tally_Ho.on_error('not_found', function (o, err) {
  o.data.result.push(err);
});

Tally_Ho.on('subtract', function (o) {
  o.finish('not_found', 1);
});


describe( '.on_error', function () {

  it( 'event handler', function () {
    var o = {result: []};
    Tally_Ho.emit('subtract', o);
    assert.deepEqual( o.result, [1]);
  });

}); // === end desc
