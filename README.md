
Tally\_Ho
===============


Install
=================

    npm install tally_ho

Use
=================

Not ready for use yet.

If you're adventurous
=====================

It combines (event emitter + async-like) functionality.

After you call `.finish` in a callback, the next
event callback is run. In other words: a waterfall
pattern.


App level
---------------------

    var F = require('tally_ho').Tally_Ho;

    F.on("read Bot", function(flow) {
      ...
      My_DB.read({...}, function (err, val) {
        flow.finish(val);
      });
    });

    F.on("read Bot", function(flow) {
      console.log(flow.last);
      flow.finish();
    });

    F.on("before read Bot", function(flow) {
      ...
    });

    F.on("after read Bot", function(flow) {
      ...
    });

    F.run("read Bot", function (flow) {
       console.log(flow.val);
    });

New Scope
---------------------

    var my_flow = F.new();

    my_flow.on("add", function (f) {
        f.finish(f.data.a + f.data.b);
    });

    my_flow.on("subtract", function (f) {
        console.log(f.last) // == 1 + 2
        f.finish();
    });

    my_flow.run("add", "subtract", {a: 1, b: 2});

Passing and Updating Data Among Callbacks
--------------------------

You can pass a data objects (ie `{my\_key: val}`) on
your runs. You can also pass multiple objects.
Each object will be "merged" into the first one you pass:

    var my_flow = F.new();

    my_flow.on('multi-merge', function (f) {
      f.data.a // --> 1
      f.data.b // --> 2
      f.data.c = 3;
      f.finish();
    });

    var data_1 = {a: 1};
    var data_2 = {b: 2};
    my_flow.run('multi-merge', data_1, data_2);
    data_1 // --> { a: 1, b: 2, c: 3}










