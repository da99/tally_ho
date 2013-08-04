var _      = require("underscore")._
  , assert = require("assert")
  , One    = require("../lib/tally_ho").Tally_Ho.new()
  , Two    = require("../lib/tally_ho").Tally_Ho.new()
;



describe( '.append', function () {

  it( 'appends arguments to .includes', function () {
    One.append(Two);
    assert.equal(_.last(One.includes), Two);
  });

}); // === end desc
