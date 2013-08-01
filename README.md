
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


App level
---------------------

    var F = require('tally_ho').Tally_Ho;

    F.on("read Bot", function(flow) {
      ...
      My_DB.read({...}, function (err, val) {
        flow.finish(val);
      });
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













