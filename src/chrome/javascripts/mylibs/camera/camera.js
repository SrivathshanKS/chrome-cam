// Generated by CoffeeScript 1.4.0
(function() {

  define(['libs/face/track', 'mylibs/effects/effects', 'mylibs/transfer/transfer', 'mylibs/localization/localization'], function(face, effects, transfer, localization) {
    'use strict';

    var animate, canvas, capture, ctx, draw, effect, errback, flash, frame, hollaback, paparazzi, paparazziUpdate, pause, paused, prepare, pub, supported, track, update, video, wrapper;
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");
    track = {
      faces: []
    };
    video = null;
    paused = false;
    wrapper = $(".wrapper");
    paparazzi = $(".paparazzi", wrapper);
    frame = 0;
    supported = true;
    effect = effects.data[0];
    draw = function() {
      if (!paused) {
        update();
      }
      return window.requestAnimationFrame(draw);
    };
    update = function() {
      ctx.drawImage(video, canvas.width, 0, -canvas.width, canvas.height);
      if (effect.tracks && frame % 4 === 0) {
        track = face.track(canvas);
      }
      frame++;
      effects.advance(canvas);
      return effect.filter(canvas, canvas, frame, track);
    };
    paparazziUpdate = function(progress) {
      if (progress.count > 1) {
        if (progress.index === 0) {
          paparazzi.removeClass("hidden");
        }
        if (progress.index === progress.count - 1) {
          setTimeout((function() {
            wrapper.removeClass("paparazzi-3");
            return paparazzi.addClass("hidden");
          }), 250);
        } else {
          wrapper.addClass("paparazzi-" + (progress.index + 2));
        }
        return wrapper.removeClass("paparazzi-" + (progress.index + 1));
      }
    };
    capture = function(progress) {
      var callback, file, image, name, saveFinished;
      callback = function() {
        return paparazziUpdate(progress);
      };
      flash(callback);
      image = canvas.toDataURL("image/jpeg", 1.0);
      name = new Date().getTime();
      file = {
        type: "jpg",
        name: "" + name + ".jpg",
        file: image
      };
      animate(file, progress);
      $.publish("/file/save", [file]);
      return saveFinished = $.subscribe("/file/saved/" + file.name, function() {
        $.unsubscribe(saveFinished);
        return $.publish("/postman/deliver", [file, "/captured/image"]);
      });
    };
    flash = function(callback) {
      var anim, div, fx;
      div = $("#flash");
      fx = kendo.fx(div);
      return anim = fx.fadeIn().play().done(function() {
        return fx.fadeOut().play().done(callback);
      });
    };
    animate = function(file, progress) {
      var callback;
      callback = function() {
        return $.publish("/postman/deliver", [file, "/bottom/thumbnail"]);
      };
      if (progress.index === 0) {
        transfer.setup();
      }
      transfer.add(file, progress);
      if (progress.index === progress.count - 1) {
        return setTimeout((function() {
          return transfer.run(callback);
        }), 200);
      }
    };
    hollaback = function(stream) {
      window.stream = stream;
      video = document.getElementById("video");
      video.src = window.URL.createObjectURL(stream);
      video.play();
      return window.requestAnimationFrame(draw);
    };
    errback = function() {
      return update = function() {
        wrapper.hide();
        paused = true;
        return $.publish("/postman/deliver", [{}, "/camera/unsupported"]);
      };
    };
    pause = function(message) {
      if (paused === message.paused) {
        return;
      }
      paused = message.paused;
      return wrapper.toggle(!paused);
    };
    prepare = function(mode) {
      if (mode === "paparazzi") {
        paparazzi.removeClass("hidden");
        return wrapper.addClass("paparazzi-1");
      }
    };
    return pub = {
      cleanup: function() {
        video.pause();
        video.src = "";
        return stream.stop();
      },
      init: function() {
        var _i, _len, _ref, _results;
        transfer.init();
        navigator.webkitGetUserMedia({
          video: true
        }, hollaback, errback);
        $.subscribe("/camera/capture", capture);
        $.subscribe("/camera/pause", pause);
        $.subscribe("/camera/update", function() {
          update();
          return $.publish("/postman/deliver", [null, "/camera/updated"]);
        });
        $.subscribe("/effects/request", function() {
          var e, filters;
          filters = (function() {
            var _i, _len, _ref, _results;
            _ref = effects.data;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              e = _ref[_i];
              _results.push({
                id: e.id,
                name: e.name
              });
            }
            return _results;
          })();
          return $.publish("/postman/deliver", [filters, "/effects/response"]);
        });
        $.subscribe("/camera/effect", function(id) {
          var e, _i, _len, _ref, _results;
          _ref = effects.data;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            e = _ref[_i];
            if (e.id === id) {
              _results.push(effect = e);
            }
          }
          return _results;
        });
        $.subscribe("/camera/snapshot/request", function() {
          var image;
          image = canvas.toDataURL("image/jpeg", 1.0);
          return $.publish("/postman/deliver", [image, "/camera/snapshot/response"]);
        });
        $.subscribe("/camera/capture/prepare", prepare);
        face.init(0, 0, 0, 0);
        effects.init();
        _ref = effects.data;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          effect = _ref[_i];
          _results.push(effect.name = localization[effect.id]);
        }
        return _results;
      }
    };
  });

}).call(this);