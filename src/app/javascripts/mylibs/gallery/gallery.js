// Generated by CoffeeScript 1.3.3
(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/gallery/views/thumb.html'], function(kendo, utils, filewrapper, template) {
    var active, add, animation, at, container, create, data, dataSource, destroy, ds, el, files, flipping, get, index, page, pageSize, pages, pub, render, select, selected, total,
      _this = this;
    pageSize = 12;
    files = [];
    ds = {};
    data = [];
    container = {};
    el = {};
    selected = {};
    total = 0;
    index = 0;
    flipping = false;
    pages = {
      previous: {},
      next: {}
    };
    active = {};
    animation = {
      effects: "pageturn:horizontal",
      reverse: false,
      duration: 800
    };
    select = function(name) {
      selected = container.find("[data-name='" + name + "']").parent(":first");
      container.find(".thumbnail").removeClass("selected");
      return selected.addClass("selected");
    };
    page = function(direction) {
      if (flipping) {
        return;
      }
      if (direction > 0 && _this.ds.page() > 1) {
        flipping = true;
        animation.reverse = true;
        _this.ds.page(_this.ds.page() - 1);
        render(true);
      }
      if (direction < 0 && _this.ds.page() < _this.ds.totalPages()) {
        flipping = true;
        animation.reverse = false;
        _this.ds.page(_this.ds.page() + 1);
        return render(true);
      }
    };
    destroy = function() {
      var name,
        _this = this;
      name = selected.children(":first").attr("data-name");
      return selected.kendoStop(true).kendoAnimate({
        effects: "zoomOut fadOut",
        hide: true,
        complete: function() {
          return filewrapper.deleteFile(name).done(function() {
            $.publish("/top/update", ["deselected"]);
            selected.remove();
            _this.ds.remove(_this.ds.get(name));
            return render();
          });
        }
      });
    };
    get = function(name) {
      var match, position;
      match = _this.ds.get(name);
      index = _this.ds.view().indexOf(match);
      position = _this.ds.page() > 1 ? pageSize * (_this.ds.page() - 1) + index : index;
      return {
        length: _this.ds.data().length,
        index: position,
        item: match
      };
      return select(name);
    };
    at = function(index) {
      var match, position, target;
      target = Math.ceil((index + 1) / pageSize);
      if (target !== _this.ds.page()) {
        _this.ds.page(target);
        render();
      }
      position = target > 1 ? index - pageSize : index;
      match = {
        length: _this.ds.data().length,
        index: index,
        item: _this.ds.view()[position]
      };
      $.publish("/details/update", [match]);
      return select(match.item.name);
    };
    dataSource = {
      create: function(data) {
        return _this.ds = new kendo.data.DataSource({
          data: data,
          pageSize: 12,
          sort: {
            dir: "desc",
            field: "name"
          },
          schema: {
            model: {
              id: "name"
            }
          }
        });
      }
    };
    add = function(item) {
      item = {
        name: item.name,
        file: item.file,
        type: item.type
      };
      if (!_this.ds) {
        return _this.ds = dataSource.create([item]);
      } else {
        return _this.ds.add(item);
      }
    };
    create = function(item) {
      var element, fadeIn;
      element = {};
      fadeIn = function(e) {
        return $(e).kendoAnimate({
          effects: "fadeIn",
          show: true
        });
      };
      if (item.type === "webm") {
        element = document.createElement("video");
        element.setAttribute("controls", "");
        element.loadeddata = fadeIn(element);
      } else {
        element = new Image();
        element.onload = fadeIn(element);
      }
      element.src = item.file;
      element.setAttribute("data-name", item.name);
      element.setAttribute("draggable", true);
      element.width = 270;
      element.height = 180;
      element.setAttribute("class", "hidden");
      return element;
    };
    render = function(flip) {
      var complete, item, thumbnail, thumbs, _i, _len, _ref;
      thumbs = [];
      _ref = _this.ds.view();
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        thumbnail = new kendo.View(pages.next, "<div class='thumbnail'></div>");
        thumbs.push({
          dom: thumbnail.render(),
          data: item
        });
      }
      $("#gallery").css("pointer-events", "none");
      complete = function() {
        var justPaged;
        setTimeout(function() {
          var _j, _len1, _results;
          _results = [];
          for (_j = 0, _len1 = thumbs.length; _j < _len1; _j++) {
            item = thumbs[_j];
            _results.push((function() {
              var element;
              element = create(item.data);
              return item.dom.append(element);
            })());
          }
          return _results;
        }, 50);
        pages.next.show();
        justPaged = pages.previous;
        justPaged.hide();
        justPaged.empty();
        pages.previous = pages.next;
        pages.next = justPaged;
        flipping = false;
        return $("#gallery").css("pointer-events", "auto");
      };
      if (flip) {
        return container.kendoAnimate({
          effects: animation.effects,
          face: animation.reverse ? pages.next : pages.previous,
          back: animation.reverse ? pages.previous : pages.next,
          duration: animation.duration,
          reverse: animation.reverse,
          complete: complete
        });
      } else {
        return complete();
      }
    };
    return pub = {
      before: function(e) {
        $.publish("/postman/deliver", [
          {
            paused: true
          }, "/camera/pause"
        ]);
        return $.subscribe("/keyboard/arrow", function(e) {
          if (!flipping) {
            return page((e === "right") - (e === "left"));
          }
        });
      },
      hide: function(e) {
        $.publish("/postman/deliver", [
          {
            paused: false
          }, "/camera/pause"
        ]);
        $.unsubscribe("/keyboard/arrow");
        pages.next.empty();
        return pages.previous.empty();
      },
      show: function(e) {
        return setTimeout(function() {
          return render();
        }, 420);
      },
      swipe: function(e) {
        return page((e.direction === "right") - (e.direction === "left"));
      },
      init: function(selector) {
        var page1, page2;
        page1 = new kendo.View(selector, null);
        page2 = new kendo.View(selector, null);
        container = page1.container;
        pages.previous = page1.render().addClass("page gallery");
        active = pages.next = page2.render().addClass("page gallery");
        page1.container.on("dblclick", ".thumbnail", function() {
          var thumb;
          thumb = $(this).children(":first");
          return $.publish("/details/show", [get("" + (thumb.data("name")))]);
        });
        page1.container.on("click", ".thumbnail", function() {
          var thumb;
          thumb = $(this).children(":first");
          $.publish("/top/update", ["selected"]);
          $.publish("/item/selected", [get("" + (thumb.data("name")))]);
          return select(thumb.data("name"));
        });
        $.subscribe("/pictures/bulk", function(message) {
          _this.ds = dataSource.create(message.message);
          _this.ds.read();
          if (_this.ds.view().length > 0) {
            return $.publish("/bottom/thumbnail", [_this.ds.view()[0]]);
          }
        });
        $.subscribe("/gallery/delete", function() {
          return destroy();
        });
        $.subscribe("/gallery/add", function(item) {
          return add(item);
        });
        $.subscribe("/gallery/at", function(index) {
          return at(index);
        });
        $.subscribe("/gallery/clear", function() {
          window.APP.app.showLoading();
          return filewrapper.clear().done(function() {
            var item, _i, _len, _ref;
            _ref = _this.ds.data();
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              item = _ref[_i];
              _this.ds.remove(item);
            }
            window.APP.app.hideLoading();
            return $.publish("/bottom/thumbnail");
          });
        });
        $.publish("/postman/deliver", [{}, "/file/read"]);
        return gallery;
      }
    };
  });

}).call(this);
