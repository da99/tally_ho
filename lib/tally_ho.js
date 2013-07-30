
var _ = require('underscore')._
;

// ================================================================
// ================== Helpers =====================================
// ================================================================

var WHITE = /\s+/g;

function canon_name(str) {
  return str.replace(WHITE, ' ').toLowerCase();
}

function list(o, raw_name) {
  var name = canon_name(raw_name);
  if (!o.funcs[name])
    o.funcs[name] = [];

  return o.funcs[name];
}

// ================================================================
// ================== Tally Ho ====================================
// ================================================================

var T = function () {
  this.funcs = {};
};

T.prototype.on = function (name, func) {
  list(this, name).push(func);
  return this;
};

T.prototype.emit = function (name, data, last) {
  Run
  .new(this, name, data, last)
  .run();
  return this;
};

exports.Tally_Ho = new T;
exports.Tally_Ho.new = function () {
  return new T;
};


// ================================================================
// ================== Run (private) ===============================
// ================================================================

var Run = function () {};


Run.new = function (tally, raw_name, init_data, last) {
  var r        = new Run;

  r.tally      = tally;
  r.event_name = canon_name(raw_name);
  r.data       = init_data;
  r.on_fin     = last;

  return r;
};


Run.prototype.run = function () {
  var me    = this;
  var tasks = list(me.tally, me.event_name);

  _.each(tasks, function (t, i) {
    t({data: me.data});
  });

  if (this.on_fin)
    this.on_fin({data: me.data});

  return;
};






