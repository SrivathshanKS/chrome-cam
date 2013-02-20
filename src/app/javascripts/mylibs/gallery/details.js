// Generated by CoffeeScript 1.4.0
(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/gallery/views/details.html'], function(kendo, utils, filewrapper, template) {
    var details, hide, index, pub, show, token, update, viewModel, visible;
    index = 0;
    visible = false;
    details = {};
    token = null;
    viewModel = kendo.observable({
      video: {
        src: function() {
          return utils.placeholder.image();
        }
      },
      img: {
        src: function() {
          return utils.placeholder.image();
        }
      },
      type: "jpeg",
      isVideo: function() {
        return this.get("type") === "webm";
      },
      next: {
        visible: false
      },
      previous: {
        visible: false
      }
    });
    hide = function() {
      $.publish("/top/update", ["gallery"]);
      $.publish("/gallery/keyboard");
      $.publish("/details/hiding");
      return kendo.fx(details.container).zoom("out").play().done(function() {
        $.unsubscribe(token);
        return token = null;
      });
    };
    show = function(message) {
      update(message);
      token = $.subscribe("/gallery/delete", function() {
        return hide();
      });
      return kendo.fx(details.container).zoom("in").play().done(function() {
        $.publish("/details/shown");
        return $.publish("/top/update", ["details"]);
      });
    };
    update = function(message) {
      var _this = this;
      return filewrapper.readFile(message.item).done(function(data) {
        viewModel.set("type", message.item.type);
        viewModel.set("img.src", data.file);
        viewModel.set("next.visible", message.index < message.length - 1);
        viewModel.set("previous.visible", message.index > 0 && message.length > 1);
        return index = message.index;
      });
    };
    return pub = {
      init: function(selector) {
        var page, that,
          _this = this;
        that = this;
        details = new kendo.View(selector, template);
        details.render(viewModel, true);
        $.subscribe("/details/hide", function() {
          visible = false;
          return hide();
        });
        $.subscribe("/details/show", function(message) {
          visible = true;
          return show(message);
        });
        $.subscribe("/details/update", function(message) {
          return update(message);
        });
        page = function(direction) {
          if (!visible) {
            return;
          }
          if (direction === "left" && viewModel.previous.visible) {
            that.previous();
          }
          if (direction === "right" && viewModel.next.visible) {
            that.next();
          }
          return false;
        };
        $.subscribe("/keyboard/arrow", page, true);
        return $.subscribe("/keyboard/esc", hide);
      },
      next: function(e) {
        return $.publish("/gallery/at", [index + 1]);
      },
      previous: function(e) {
        return $.publish("/gallery/at", [index - 1]);
      }
    };
  });

}).call(this);
