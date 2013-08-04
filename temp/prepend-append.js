T.prototype.prepend = function () {
  return this.insert(arguments, true);
};

T.prototype.append = function () {
  return this.insert(arguments);
};

T.prototype.insert = function (raw_arr, top) {
  var me = this;
  var arr = _.flatten(_.toArray(raw_arr));
  if (top)
    arr.reverse();

  _.each(arr, function (v) {
    me.includes = _.reject(me.includes, function (o) {
      return v === o;
    });
    me.includes[(top) ? 'unshift' : 'push'](v);
  });

  me.includes = _.uniq(me.includes);
  return me;
};

