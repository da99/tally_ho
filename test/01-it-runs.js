
var _        = require("underscore")._
  , assert   = require("assert")
  , Tally_Ho = require("../lib/tally_ho").Tally_Ho.new()
  , F        = require("../lib/tally_ho").Tally_Ho.new()
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
  o.data.result.push(o.run.proc_list[0]);
  o.finish();
});


describe( '.run', function () {

  it( 'runs events in defined order', function (done) {
    process.nextTick(function () {
      Tally_Ho.run('add', {result: []}, function (o) {
        assert.deepEqual( o.data.result, [1,2]);
        done();
      })
    });
  });

  it( 'runs on multi-defined events', function (done) {
    process.nextTick(function () {
      Tally_Ho.run('mult', {result: []}, function (o) {
        assert.deepEqual( o.data.result, ['mult']);
      })

      Tally_Ho.run('div', {result: []}, function (o) {
        assert.deepEqual( o.data.result, ['div']);
        done();
      })
    });
  });

  it( 'combines data objects into one object', function () {
    var t = F;
    var o = {};
    t.on('one', function (d) {
      _.extend(o, d.data, {two: 'b'});
      d.finish();
    });

    t.on('one', function (d) {
      _.extend(o, d.data, {three: 'c'});
      d.finish();
    });

    t.run('one', {zero: 0}, {one: 1});

    assert.deepEqual(o, {zero: 0, one: 1, two: 'b', three: 'c'});
  });

}); // === end desc
