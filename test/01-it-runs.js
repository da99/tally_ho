
var _      = require("underscore")._
  , assert = require("assert")
  , Tally_Ho=require("../lib/tally_ho").Tally_Ho
  , T      = require("../lib/tally_ho").Tally_Ho.new()
  , F      = require("../lib/tally_ho").Tally_Ho.new()
;

T.on('add', function (o) {
  o.data.result.push(1);
  o.finish();
});

T.on('add', function (o) {
  o.data.result.push(2);
  o.finish();
});

T.on('mult', 'div', function (o) {
  o.data.result.push(o.run.proc_list[0]);
  o.finish();
});


describe( '.run', function () {

  it( 'prepends arguments to .includes', function () {
    var t1 = Tally_Ho.new();
    t1._val = 1;

    var t2 = Tally_Ho.new();
    t2._val = 2;

    var t3 = Tally_Ho.new(t1, t2);
    assert.equal(t3.includes[0]._val, t1._val);
    assert.equal(t3.includes[1]._val, t2._val);
  });

  it( 'runs events in defined order', function (done) {
    process.nextTick(function () {
      T.run('add', {result: []}, function (o) {
        assert.deepEqual( o.data.result, [1,2]);
        done();
      })
    });
  });

  it( 'runs on multi-defined events', function (done) {
    process.nextTick(function () {
      T.run('mult', {result: []}, function (o) {
        assert.deepEqual( o.data.result, ['mult']);
      })

      T.run('div', {result: []}, function (o) {
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
