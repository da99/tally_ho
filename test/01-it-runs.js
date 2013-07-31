
var _    = require("underscore")._,
assert   = require("assert"),
Tally_Ho = require("../lib/tally_ho").Tally_Ho.new()
;

Tally_Ho.on('add', function (o) {
  o.data.result.push(1);
  o.finish();
});

Tally_Ho.on('add', function (o) {
  o.data.result.push(2);
  o.finish();
});

Tally_Ho.on('mult', 'div', function (o) {
  o.data.result.push(o.run.event_name);
  o.finish();
});


describe( 'Tally_Ho', function () {

  it( 'runs events in defined order', function (done) {
    process.nextTick(function () {
      Tally_Ho.emit('add', {result: []}, function (o) {
        assert.deepEqual( o.data.result, [1,2]);
        done();
      })
    });
  });

  it( 'runs on multi-defined events', function (done) {
    process.nextTick(function () {
      Tally_Ho.emit('mult', {result: []}, function (o) {
        assert.deepEqual( o.data.result, ['mult']);
      })

      Tally_Ho.emit('div', {result: []}, function (o) {
        assert.deepEqual( o.data.result, ['div']);
        done();
      })
    });
  });

}); // === end desc
