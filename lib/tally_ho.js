
var _ = require('underscore')._
;

// ================================================================
// ================== Helpers =====================================
// ================================================================

var WHITE = /\s+/g;

function canon_name(str) {
  return str.replace(WHITE, ' ').toLowerCase().trim();
}

// ================================================================
// ================== Tally Ho ====================================
// ================================================================

var T = function () {
  this.funcs = {};
  this.includes = [this];
};

T.prototype.entire_list_for = function (name) {
  var arr = [
    this.list_with_includes('before ' + name),
    this.list_with_includes(name),
    this.list_with_includes('after '  + name)
  ];

  return _.flatten(arr);
};

// ================== running =====================================

T.prototype.run_error = function () {
  var args = _.toArray(arguments);
  var tasks = [];
  if (!this.entire_list_for(args[0]).length)
    throw new Error("Error handlers not found for: " + args[0]);
  return this.run.apply(this, arguments);
};

T.prototype.run = function () {

  var args = _.toArray(arguments);

  var funcs  = _.select(args, function (u) {
    return _.isString(u) || _.isFunction(u);
  });

  var str_funcs = _.select(funcs, function (u) {
    return _.isString(u);
  });

  var parent = _.detect(args, function (u) {
    return u && u.is_task_env;
  });

  var non_data = _.flatten([funcs, parent]);

  // === grab and merge data objects
  var data = null;

  _.each(args, function (u) {
    if (_.isObject(u) && non_data.indexOf(u) < 0 && !u.is_task_env) {
      if (!data)
        data = u;
      else
        _.extend(data, u);
    }
  });

  //
  // if non string names, only funcs:
  // Example:
  //    .run(parent, {}, func1, func2);
  //    .run(parent,     func1, func2);
  //
  if (str_funcs.length === 0) {
    var t  = exports.Tally_Ho.new();
    var name = 'one-off';
    _.each(funcs, function (f) {
      t.on.apply(t, [name, f]);
    });

    return t.run.apply(t, _.compact([parent, name, data]));
  } // ==== if

  Run
  .new(this, parent, (data || {}), funcs)
  .run();

  return this;
};

// ================== defining stuff ==============================


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
};

T.prototype.list_with_includes = function (raw_name) {
  var me  = this;
  var arr = [];
  arr.push(_.map(me.includes, function (t) {
    if (t === me)
      return t.list(raw_name);
    else
      return t.list_with_includes(raw_name);
  }));

  return _.flatten(arr);
};

// ================================================================
// ================== export the public-y stuff ===================
// ================================================================

exports.Tally_Ho = new T;
exports.Tally_Ho.new = function () {
  var t = new T;

  if (arguments.length) {
    _.each(_.flatten(_.toArray(arguments)).reverse(), function (v) {
      t.includes.unshift(v);
    });

    t.includes = _.uniq(t.includes);
  }


  return t;
};


// ================================================================
// ================== Run (private) ===============================
// ================================================================

var Run = function () {};


Run.new = function (tally, parent, init_data, arr) {

  var r       = new Run;
  r.tally     = tally;
  r.parent    = parent;
  r.proc_list = _.map(arr, function (n) {
    if (_.isString(n))
      return canon_name(n);
    else
      return n;
  });

  r.data        = init_data;

  return r;
};

Run.prototype.next = function (last) {

  if (arguments.length === 1)
    this.val = arguments[0];

  this.last = last;

  var me    = this;

  var next  = me.tasks.shift();

  if (next)
    next(Task_Env.new(me), this.last);
  else {

    me.is_done = true;

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
    me.tasks.push( me.tally.list('parent run') );

  _.each(me.proc_list, function (name) {
    if (_.isFunction(name))
      return me.tasks.push(name);

    me.tasks.push(me.tally.entire_list_for(name));

  });

  me.tasks = _.flatten(me.tasks);

  me.next();
  return;
};




// ================================================================
// ================== Task_Env (private) ==========================
// ================================================================

var Task_Env = function () {};

Task_Env.new = function (run) {
  var t  = new Task_Env;
  t.run  = run;
  t.data = run.data;
  t.last = run.last;
  t.val  = run.val;
  t.is_task_env = true;

  // da_river compatibility
  t.is_job = true;
  return t;
};

// da_river compatibility
Task_Env.prototype.is_finished = function () {
  return !!this.is_done;
};

Task_Env.prototype.finish = function (name_or_val, err) {

  if (this.is_done || this.run.is_done)
    throw new Error(".finish called more than once.");

  this.is_done = true;

  // if .finish(name, err);
  if (arguments.length > 1) { // error
    if (this.run.parent)
      return this.run.parent.finish(name_or_val, err);
    else
      return this.run.tally.run_error(name_or_val, this.data, {error: err});
  }

  // if .finish(val)
  if (arguments.length === 1)
    return this.run.next( name_or_val );

  // .finish()
  return this.run.next();
};

Task_Env.prototype.detour = function () {
  var args = _.toArray(arguments);
  args.unshift(this);
  args.unshift(this.data);

  var flow = this.run.tally;

  return flow.run.apply(flow, args);
};


