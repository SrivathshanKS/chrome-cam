// Generated by CoffeeScript 1.4.0
(function() {

  define([], function() {
    var key, pub;
    key = {
      arrows: {
        up: 38,
        down: 40,
        left: 37,
        right: 39
      },
      esc: 27,
      space: ' '.charCodeAt(0),
      enter: 13,
      w: 'W'.charCodeAt(0),
      page: {
        up: 33,
        down: 34
      }
    };
    return pub = {
      init: function() {
        var p;
        p = function(name, key) {
          return $.publish("/keyboard/" + name, [key]);
        };
        return $(document).keydown(function(e) {
          switch (e.which) {
            case key.arrows.left:
              return p("arrow", "left");
            case key.arrows.right:
              return p("arrow", "right");
            case key.arrows.up:
              return p("arrow", "up");
            case key.arrows.down:
              return p("arrow", "down");
            case key.esc:
              return p("esc", "esc");
            case key.space:
              return p("space", {
                ctrlKey: e.ctrlKey || e.metaKey
              });
            case key.w:
              if (e.ctrlKey || e.metaKey) {
                return p("close");
              }
              break;
            case key.enter:
              return p("enter");
            case key.page.up:
              return p("page", "up");
            case key.page.down:
              return p("page", "down");
          }
        });
      }
    };
  });

}).call(this);
