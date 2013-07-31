
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

T.prototype.on_error = function (name, func) {
  if (this.on_error_name)
    throw new Error("on_error already used: ", this.on_error_name, ' -> ', name);
  this.on_error_name = name;
  this.on_error_func = func;
  return this;
};

T.prototype.run_error = function (name, err, run) {
  if (!this.on_error_name || this.on_error_name !== name)
    throw err;
  return this.on_error_func(run, err);
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

Run.prototype.next = function () {
  var me    = this;
  me.tasks.shift()(Task_Env.new(me));

  return me;
};

Run.prototype.run = function () {
  var me   = this;

  if (me.tasks)
    throw new Error("Already running.");

  me.tasks = list(me.tally, me.event_name);

  if (me.on_fin)
    me.tasks.push( me.on_fin );

  me.next();
  return;
};



// ================================================================
// ================== Task_Env (private) ==========================
// ================================================================

var Task_Env = function () {};

Task_Env.new = function (run, list) {
  var t  = new Task_Env;
  t.run  = run;
  t.data = run.data;
  return t;
};

Task_Env.prototype.finish = function () {
  var meth = "__finish__";
  if (arguments.length > 1)
    meth = "__error__";

  return this[meth].apply(this, arguments);
};

Task_Env.prototype.__finish__ = function (val) {
  return this.run.next();
};

Task_Env.prototype.__error__ = function (name, err) {
  this.run.tally.run_error(name, err, this);
  return this;
};


