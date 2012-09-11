(function() {

  define(['Kendo', 'mylibs/effects/effects', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/full/views/full.html'], function(kendo, effects, utils, filewrapper, template) {
    var $container, $flash, canvas, capture, ctx, draw, el, flash, frame, frames, paused, preview, pub, recording, startTime, webgl;
    canvas = {};
    ctx = {};
    webgl = {};
    preview = {};
    paused = true;
    frame = 0;
    frames = [];
    recording = false;
    $flash = {};
    startTime = 0;
    $container = {};
    el = {};
    draw = function() {
      return $.subscribe("/camera/stream", function(stream) {
        var time;
        if (!paused) {
          frame++;
          this.thing(canvas, stream.canvas, frame, stream.track);
          if (recording) {
            time = Date.now();
            frames.push({
              imageData: ctx.getImageData(0, 0, 720, 480),
              time: Date.now()
            });
            return el.container.find(".timer").first().html(kendo.toString((Date.now() - startTime) / 1000, "0"));
          }
        }
      });
    };
    flash = function(callback) {
      el.flash.show();
      return el.flash.kendoStop(true).kendoAnimate({
        effects: "fadeOut",
        duration: 1500,
        hide: true,
        complete: function() {
          return callback();
        }
      });
    };
    capture = function(callback) {
      var image, name;
      image = canvas.toDataURL();
      name = new Date().getTime() + ".jpg";
      filewrapper.save(name, image).done(function() {
        $.publish("/bar/preview/update", [
          {
            thumbnailURL: image
          }
        ]);
        return $.publish("/gallery/add", [
          {
            type: 'jpg',
            name: name
          }
        ]);
      });
      return flash(callback);
    };
    return pub = {
      init: function(selector) {
        var full;
        full = new kendo.View(selector, template);
        canvas = document.createElement("canvas");
        canvas.width = 720;
        canvas.height = 480;
        ctx = canvas.getContext("2d");
        full.render().prepend(canvas);
        full.find(".flash", "flash");
        $.subscribe("/full/show", function(item) {
          this.thing = item.filter;
          paused = false;
          $.publish("/bottom/update", ["full"]);
          full.content.height(full.container.height()) - 50;
          full.content.width((3 / 2) * full.content.height());
          $(canvas).height(full.content.height());
          return full.container.kendoStop(true).kendoAnimate({
            effects: "zoomIn fadeIn",
            show: true
          });
        });
        $.subscribe("/full/hide", function() {
          paused = true;
          $.publish("/bottom/update", ["preview"]);
          return full.container.kendoStop(true).kendoAnimate({
            effects: "zoomOut fadeOut",
            hide: true,
            complete: function() {
              return $.publish("/preview/pause", [false]);
            }
          });
        });
        $.subscribe("/capture/photo", function() {
          var callback;
          callback = function() {
            return $.publish("/bottom/update", ["full"]);
          };
          return capture(callback);
        });
        $.subscribe("/capture/paparazzi", function() {
          var callback;
          callback = function() {
            callback = function() {
              callback = function() {
                return $.publish("/bottom/update", ["full"]);
              };
              return capture(callback);
            };
            return capture(callback);
          };
          return capture(callback);
        });
        $.subscribe("/capture/video", function() {
          console.log("Recording...");
          frames = [];
          startTime = Date.now();
          full.container.find(".timer").removeClass("hidden");
          setTimeout((function() {
            utils.createVideo(frames);
            console.log("Recording Done!");
            recording = false;
            full.container.find(".timer").addClass("hidden");
            return $.publish("/recording/done", ["full"]);
          }), 6000);
          return recording = true;
        });
        return draw();
      }
    };
  });

}).call(this);
