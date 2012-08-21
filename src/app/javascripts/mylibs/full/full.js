(function() {

  define(['mylibs/utils/utils', 'libs/webgl/glfx'], function(utils) {
    var canvas, ctx, draw, frame, paused, preview, pub, webgl;
    canvas = {};
    ctx = {};
    preview = {};
    webgl = {};
    preview = {};
    paused = true;
    frame = 0;
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        if (!paused) {
          frame++;
          return preview.filter(webgl, stream.canvas, frame, stream);
        }
      });
    };
    return pub = {
      init: function(selector) {
        var $container, $wrapper;
        kendo.fx.grow = {
          setup: function(element, options) {
            return $.extend({
              top: options.top,
              left: options.left,
              width: options.width,
              height: options.height
            }, options.properties);
          }
        };
        $container = $(selector);
        canvas = document.createElement("canvas");
        ctx = canvas.getContext("2d");
        $wrapper = $("<div></div>");
        $container.append($wrapper);
        webgl = fx.canvas();
        $(webgl).dblclick(function() {
          $.publish("/camera/pause", [true]);
          return $container.kendoStop(true).kendoAnimate({
            effects: "zoomOut",
            hide: "true",
            complete: function() {
              paused = true;
              $.publish("/camera/pause", [false]);
              return $.publish("/previews/pause", [false]);
            }
          });
        });
        $wrapper.append(webgl);
        $.subscribe("/full/show", function(e) {
          $.extend(preview, e);
          $.publish("/camera/pause", [true]);
          $wrapper.height($container.height() - 50);
          $wrapper.width((3 / 2) * $wrapper.height());
          $(webgl).width($wrapper.width());
          $(webgl).height("height", $wrapper.height());
          return $container.kendoStop(true).kendoAnimate({
            effects: "zoomIn",
            show: "true",
            complete: function() {
              $.publish("/camera/pause", [false]);
              return paused = false;
            }
          });
        });
        $.subscribe("/capture/image", function() {});
        return draw();
      }
    };
  });

}).call(this);
