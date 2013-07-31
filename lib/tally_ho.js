
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

T.prototype.run = function () {
  var funcs  = _.toArray(arguments);
  var parent = (_.isFunction(funcs[0])) ? null : funcs.shift();
  var t      = exports.Tally_Ho.new();
  var name   = 'one-off';
  _.each(funcs, function (f) {
    t.on(name, f);
  });

  return (parent) ?
    t.emit(parent, name) :
    t.emit(name);
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

T.prototype.emit = function () {
  var args = _.toArray(arguments);

  var parent, names = [], data, last;

  _.each(args, function (a) {
    if (a.is_task_env)
      parent = a;
    else if (_.isFunction(a)) {
      last = a;
    } else if (_.isString(a) && !data) {
      names.push(a);
    } else if (a)
      data = a;
  });

  if (!data)
    data = {};

  Run
  .new(this, parent, names, data, last)
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


Run.new = function (tally, parent, raw_names, init_data, last) {
  var r        = new Run;

  r.parent      = parent;
  r.tally       = tally;
  r.names       = _.map(raw_names, function (n) {
    return canon_name(n);
  });

  r.data        = init_data;
  r.on_fin      = last;
  return r;
};

Run.prototype.next = function (last) {

  if (arguments.length === 1)
    this.val = arguments[0];

  this.last = last;

  var me    = this;
  var next  = me.tasks.shift();
  if (next)
    next(Task_Env.new(me));
  else {
    if (me.parent)
      return me.parent.finish(last);
  }

  return me;
};

Run.prototype.run = function () {
  var me   = this;

  if (me.tasks)
    throw new Error("Already running.");

  me.tasks = [];
  if (!me.parent)
    me.tasks.push( me.tally.list('parent emit') );


  _.each(me.names, function (name) {
    me.tasks.push(me.tally.list('before ' + name));
    me.tasks.push(me.tally.list(            name));
    me.tasks.push(me.tally.list('after '  + name));
  });

  if (me.on_fin)
    me.tasks.push( me.on_fin );

  me.tasks = _.flatten(me.tasks);
  me.next();
  return;
};



// ================================================================
// ================== Task_Env (private) ==========================
// ================================================================

var Task_Env = function () {};

Task_Env.new = function (run, last) {
  var t  = new Task_Env;
  t.run  = run;
  t.data = run.data;
  t.last = run.last;
  t.val  = run.val;
  t.is_task_env = true;
  return t;
};

Task_Env.prototype.finish = function (name_or_val, err) {

  // if .finish(name, err);
  if (arguments.length > 1) // error
    return this.run.tally.run_error(name_or_val, err, this);

  // if .finish(val)
  if (arguments.length === 1)
    return this.run.next( name_or_val );

  // .finish()
  return this.run.next();
};



