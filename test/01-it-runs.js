
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

  it( 'runs events in defined order', function (done) {
    process.nextTick(function () {
      T.run('add', {result: []}, function (o) {
        assert.deepEqual(o.data.result, [1,2]);
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



describe( '.run .includes', function () {
  it( 'prepends arguments in specified order to .includes', function () {
    var t1 = Tally_Ho.new();
    t1._val = 1;

    var t2 = Tally_Ho.new();
    t2._val = 2;

    var t3 = Tally_Ho.new(t1, t2);
    assert.equal(t3.includes[0]._val, t1._val);
    assert.equal(t3.includes[1]._val, t2._val);
  });

  it( 'filters out duplicates among arguments in .includes', function () {
    var t1 = Tally_Ho.new();
    var t2 = Tally_Ho.new(t1, t1, t1);
    assert.equal(t2.includes.length, 2);
  });

  it( 'runs events in .includes', function () {
    var t1 = Tally_Ho.new();
    t1.on('one', function (f) { f.data.vals.push(1); f.finish(); });
    t1.on('two', function (f) { f.data.vals.push(2); f.finish(); });

    var t2 = Tally_Ho.new(t1, t1, t1);
    t2.on('one', function (f) { f.data.vals.push(3); f.finish(); });
    t2.on('two', function (f) { f.data.vals.push(4); f.finish(); });

    var o = {vals: []};
    t2.run('one', 'two', o);
    assert.deepEqual(o, {vals: [1,3,2,4]});
  });

}); // === end desc







