var _      = require("underscore")._
  , assert = require("assert")
  , One    = require("../lib/tally_ho").Tally_Ho.new()
  , Two    = require("../lib/tally_ho").Tally_Ho.new()
;


describe( '.prepend', function () {

  it( 'prepends arguments to .includes', function () {
    One.prepend(Two);
    assert.equal(_.first(One.includes), Two);
  });

  it( 'removes duplicates', function () {
    var l = One.includes.length;
    One.prepend(Two, Two);
    assert.equal(One.includes.length, l);
  });
}); // === end desc

describe( '.append', function () {

  it( 'appends arguments to .includes', function () {
    One.append(Two);
    assert.equal(_.last(One.includes), Two);
  });

  it( 'removes duplicates', function () {
    var l = One.includes.length;
    One.append(Two, Two);
    assert.equal(One.includes.length, l);
  });

}); // === end desc
