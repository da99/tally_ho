
var _ = require('underscore')._
;

// ================================================================
// ================== Helpers =====================================
// ================================================================

var WHITE = /\s+/g;

function canon_name(str) {
  return str.replace(WHITE, ' ').toLowerCase();
}

// ================================================================
// ================== Tally Ho ====================================
// ================================================================

var T = function () {
  this.funcs = {};
};

T.prototype.on = function (_names, func) {
  var me   = this;
  var args = _.toArray(arguments);
  func = args.pop();
  _.each(args, function (name) {
    me.list(name, true).push(func);
  });

  return me;
};

T.prototype.on_error = function (name, func) {
  if (this.on_error_name)
    throw new Error("on_error already used: ", this.on_error_name, ' -> ', name);
  this.on_error_name = name;
  this.on_error_func = func;
  return this;
};

T.prototype.list = function (raw_name, create_if_needed) {
  var o = this;
  var name = canon_name(raw_name);
  if (!o.funcs[name] && create_if_needed)
    o.funcs[name] = [];

  return o.funcs[name] || [];
}


T.prototype.run_error = function (name, err, task_env) {
  if (!this.on_error_name || this.on_error_name !== name) {
    if (task_env.run.parent)
      return task_env.run.parent.finish(name, err);
    throw (err || "Unknown error.");
  }
  return this.on_error_func(task_env, err);
};

T.prototype.emit = function (parent, name, data, last) {
  var args = _.toArray(arguments);
  if (_.isString(parent)) {
    parent = null;
    name = args.shift();
    data = args.shift();
    last = args.shift();
  }

  if (_.isFunction(data)) {
    last = data;
    data = {};
  }

  Run
  .new(this, parent, name, data, last)
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


Run.new = function (tally, parent, raw_name, init_data, last) {
  var r        = new Run;

  r.parent     = parent;
  r.tally      = tally;
  r.event_name = canon_name(raw_name);
  r.data       = init_data;
  r.on_fin     = last;
  return r;
};

Run.prototype.next = function () {

  var me    = this;
  var next  = me.tasks.shift();
  if (next)
    next(Task_Env.new(me));
  else {
    if (me.parent)
      return me.parent.finish();
  }

  return me;
};

Run.prototype.run = function () {
  var me   = this;

  if (me.tasks)
    throw new Error("Already running.");

  me.tasks = me.tally.list('before ' + me.event_name)
  .concat( me.tally.list(me.event_name) )
  .concat( me.tally.list('after ' + me.event_name) );

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


