// Generated by CoffeeScript 1.4.0
(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'mylibs/navigation/navigation', 'text!mylibs/full/views/full.html'], function(kendo, utils, filewrapper, navigation, template) {
    var capture, effectId, elements, frame, full, index, navigating, paparazzi, paused, pub, subscribe;
    paused = true;
    frame = 0;
    full = {};
    effectId = "";
    paparazzi = {};
    capture = function(callback, progress) {
      var captured;
      captured = $.subscribe("/captured/image", function(file) {
        $.unsubscribe(captured);
        $.publish("/gallery/add", [file]);
        return callback();
      });
      return $.publish("/postman/deliver", [progress, "/camera/capture"]);
    };
    index = {
      current: function() {
        var i, _i, _ref;
        for (i = _i = 0, _ref = APP.filters.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (APP.filters.id === effectId) {
            return i;
          }
        }
      },
      max: function() {
        return APP.filters.length;
      },
      select: function(i) {
        return pub.select(APP.filters[i]);
      },
      preview: function(i) {
        return pub.select(APP.filters[i], true);
      },
      unpreview: function() {
        return pub.select(APP.filters[index.saved]);
      },
      saved: 0
    };
    subscribe = function(pub) {
      $.subscribe("/full/show", function(item) {
        return pub.show(item);
      });
      $.subscribe("/camera/snapshot", function(url) {
        return full.el.snapshot.attr("src", url);
      });
      $.subscribe("/capture/photo", function() {
        return pub.photo();
      });
      $.subscribe("/capture/paparazzi", function() {
        return pub.paparazzi();
      });
      $.subscribe("/countdown/paparazzi", function() {
        return full.el.paparazzi.removeClass("hidden");
      });
      $.subscribe("/full/filters/show", function(show) {
        var duration;
        duration = 200;
        if (show) {
          return full.el.filters.kendoStop().kendoAnimate({
            effects: "slideIn:right fade:in",
            show: true,
            hide: false,
            duration: duration
          });
        } else {
          return full.el.filters.kendoStop().kendoAnimate({
            effects: "slide:left fade:out",
            hide: true,
            show: false,
            duration: duration
          });
        }
      });
      $.subscribe("/full/capture/begin", function(mode) {
        $.publish("/postman/deliver", [mode, "/camera/capture/prepare"]);
        return full.el.wrapper.addClass("capturing");
      });
      $.subscribe("/full/capture/end", function() {
        return full.el.wrapper.removeClass("capturing");
      });
      return $.subscribe("/keyboard/arrow", function(dir) {
        if (paused) {
          return;
        }
        if (dir === "up" && index.current() > 0) {
          index.select(index.current() - 1);
        }
        if (dir === "down" && index.current() + 1 < index.max()) {
          return index.select(index.current() + 1);
        }
      });
    };
    elements = {
      cache: function(full) {
        full.find(".timer", "timer");
        full.find(".wrapper", "wrapper");
        full.find(".snapshot", "snapshot");
        full.find(".paparazzi", "paparazzi");
        return full.find(".filters-list", "filters");
      }
    };
    navigating = {
      to: function() {
        var deferred, updated;
        deferred = $.Deferred();
        APP.bottom.pause(false);
        updated = $.subscribe("/camera/updated", function() {
          var token;
          $.unsubscribe(updated);
          token = $.subscribe("/camera/snapshot/response", function(url) {
            $.unsubscribe(token);
            full.el.snapshot.attr("src", url);
            return deferred.resolve();
          });
          return $.publish("/postman/deliver", [null, "/camera/snapshot/request"]);
        });
        $.publish("/postman/deliver", [null, "/camera/update"]);
        return deferred.promise();
      },
      from: function() {
        var deferred, token;
        deferred = $.Deferred();
        APP.bottom.pause(true);
        token = $.subscribe("/camera/snapshot/response", function(url) {
          $.unsubscribe(token);
          full.el.snapshot.attr("src", url);
          return deferred.resolve();
        });
        $.publish("/postman/deliver", [null, "/camera/snapshot/request"]);
        return deferred.promise();
      }
    };
    return pub = {
      init: function(selector) {
        full = new kendo.View(selector, template);
        full.render();
        navigation.navigating.to("#home", navigating.to);
        navigation.navigating.from("#home", navigating.from);
        elements.cache(full);
        return subscribe(pub);
      },
      before: function() {
        return setTimeout((function() {
          return $.publish("/postman/deliver", [
            {
              paused: false
            }, "/camera/pause"
          ]);
        }), 500);
      },
      show: function(item) {
        if (!paused) {
          return;
        }
        pub.select(item);
        paused = false;
        return full.container.kendoStop(true).kendoAnimate({
          effects: "zoomIn fadeIn",
          show: true,
          complete: function() {
            return $.publish("/bottom/update", ["full"]);
          }
        });
      },
      select: function(item, temp) {
        effectId = item.id;
        if (!temp) {
          full.el.filters.find("li").removeClass("selected").filter("[data-filter-id=" + item.id + "]").addClass("selected");
        }
        return $.publish("/postman/deliver", [effectId, "/camera/effect"]);
      },
      filter: {
        click: function(e) {
          var i;
          i = $(e.target).data("filter-index");
          index.saved = i;
          return index.select(i);
        },
        mouseover: function(e) {
          return index.preview($(e.target).data("filter-index"));
        },
        mouseout: function(e) {
          return index.unpreview();
        }
      },
      photo: function() {
        var callback;
        callback = function() {
          $.publish("/bottom/update", ["full"]);
          return $.publish("/full/capture/end");
        };
        return capture(callback, {
          index: 0,
          count: 1
        });
      },
      paparazzi: function() {
        var callback;
        callback = function() {
          callback = function() {
            callback = function() {
              $.publish("/bottom/update", ["full"]);
              return $.publish("/full/capture/end");
            };
            return setTimeout((function() {
              return capture(callback, {
                index: 2,
                count: 3
              });
            }), 1000);
          };
          return setTimeout((function() {
            return capture(callback, {
              index: 1,
              count: 3
            });
          }), 1000);
        };
        return capture(callback, {
          index: 0,
          count: 3
        });
      }
    };
  });

}).call(this);
