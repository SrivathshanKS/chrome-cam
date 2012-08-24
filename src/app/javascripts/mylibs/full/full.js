// Generated by CoffeeScript 1.3.3
(function() {

  define(['mylibs/utils/utils', 'text!mylibs/full/views/full.html', 'libs/webgl/glfx'], function(utils, fullTemplate) {
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
          return preview.filter(webgl, stream.canvas, frame, stream.track);
        }
      });
    };
    return pub = {
      init: function(selector) {
        var $container, $content, $flash;
        $.subscribe("/capture/image", function() {
          var image, name, token;
          image = webgl.toDataURL();
          name = new Date().getTime() + ".jpg";
          token = $.subscribe("/file/saved/" + name, function() {
            $.publish("/bar/preview/update", [
              {
                thumbnailURL: image
              }
            ]);
            return $.unsubscribe(token);
          });
          return $.publish("/postman/deliver", [
            {
              name: name,
              image: image
            }, "/file/save"
          ]);
        });
        $.subscribe("/capture/video/record", function() {
          var RECORD_FRAME_RATE, addFrame, frames, recordBuffer, recordBufferCanvas, recordInterval, token;
          console.log("Recording...");
          RECORD_FRAME_RATE = 1000 / 30;
          recordBufferCanvas = document.createElement("canvas");
          recordBufferCanvas.width = 720 / 2;
          recordBufferCanvas.height = 480 / 2;
          recordBuffer = recordBufferCanvas.getContext("2d");
          recordBuffer.scale(0.5, 0.5);
          frames = [];
          addFrame = function() {
            recordBuffer.drawImage(webgl, 0, 0);
            frame = recordBufferCanvas.toDataURL('image/webp', 0.9);
            return frames.push(frame);
          };
          recordInterval = setInterval(addFrame, RECORD_FRAME_RATE);
          token = $.subscribe("/camera/video/stop", function() {
            var blob;
            console.log("Done recording!");
            clearInterval(recordInterval);
            blob = Whammy.fromImageArray(frames, RECORD_FRAME_RATE);
            console.log(window.URL.createObjectURL(blob));
            return $.unsubscribe(token);
          });
          return setTimeout((function() {
            return $.publish("/camera/video/stop", []);
          }), 6000);
        });
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
        $content = $(fullTemplate).appendTo($container);
        $flash = $content.find(".flash");
        webgl = fx.canvas();
        $(webgl).dblclick(function() {
          $.publish("/bar/capture/hide");
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
        $content.prepend(webgl);
        $.subscribe("/full/show", function(e) {
          $.publish("/bar/capture/show");
          $.extend(preview, e);
          $.publish("/camera/pause", [true]);
          $content.height($container.height() - 50);
          $content.width((3 / 2) * $content.height());
          $(webgl).width($content.width());
          $(webgl).height("height", $content.height());
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
        $.subscribe("/full/flash", function() {
          $flash.show();
          return $flash.kendoStop(true).kendoAnimate({
            effects: "fadeOut",
            duration: 2000,
            hide: true
          });
        });
        return draw();
      }
    };
  });

}).call(this);
