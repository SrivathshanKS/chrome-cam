(function() {

  define(['Kendo', 'mylibs/utils/utils', 'mylibs/file/filewrapper', 'text!mylibs/gallery/views/row.html'], function(kendo, utils, filewrapper, template) {
    var add, animation, at, container, destroy, dim, ds, el, files, get, index, page, pageSize, pub, selected, total,
      _this = this;
    pageSize = 8;
    dim = {
      cols: 4,
      rows: 3
    };
    ds = {};
    files = [];
    container = {};
    el = {};
    selected = {};
    total = 0;
    index = 0;
    animation = {
      effects: "pageturn:horizontal",
      reverse: false,
      duration: 800
    };
    page = function(direction) {
      if (direction > 0 && _this.ds.page() > 1) {
        animation.reverse = true;
        _this.ds.page(_this.ds.page() - 1);
      }
      if (direction < 0 && _this.ds.page() < _this.ds.totalPages()) {
        animation.reverse = false;
        return _this.ds.page(_this.ds.page() + 1);
      }
    };
    destroy = function() {
      var name;
      name = selected.find("img").data("file-name");
      return selected.kendoStop(true).kendoAnimate({
        effects: "zoomOut fadOut",
        hide: true,
        complete: function() {
          return filewrapper.deleteFile(name).done(function() {
            selected.remove();
            return this.ds.remove(this.ds.get(name));
          });
        }
      });
    };
    get = function(name) {
      var match;
      match = _this.ds.get(name);
      return {
        length: _this.ds.data().length,
        index: _this.ds.view().indexOf(match),
        item: match
      };
    };
    at = function(index) {
      var match, position;
      page = Math.ceil((index + 1) / pageSize);
      _this.ds.page(page);
      position = page > 1 ? index - pageSize : index;
      match = {
        length: _this.ds.data().length,
        index: index,
        item: _this.ds.view()[position]
      };
      return $.publish("/details/update", [match]);
    };
    add = function(item) {
      return _this.ds.add({
        name: item.name,
        file: item.file,
        type: item.type
      });
    };
    return pub = {
      before: function(e) {
        container.parent().height($(window).height() - 50);
        container.parent().width($(window).width());
        return $.publish("/camera/pause", [true]);
      },
      hide: function(e) {
        return $.publish("/camera/pause", [false]);
      },
      swipe: function(e) {
        return page((e.direction === "right") - (e.direction === "left"));
      },
      init: function(selector) {
        var f, nextPage, page1, page2, previousPage;
        page1 = new kendo.View(selector, null);
        page2 = new kendo.View(selector, null);
        container = page1.container;
        previousPage = page1.render().addClass("page gallery");
        nextPage = page2.render().addClass("page gallery");
        page1.container.on("dblclick", ".thumbnail", function() {
          var media;
          media = $(this).children().first();
          return $.publish("/details/show", [get("" + (media.data("file-name")))]);
        });
        page1.container.on("click", ".thumbnail", function() {
          $.publish("/top/update", ["selected"]);
          page1.find(".thumbnail").removeClass("selected");
          return selected = $(this).addClass("selected");
        });
        f = [
          {
            name: "123456",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "1",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "2",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "3",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "4",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "5",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "6",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "7",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "8",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "9",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "10",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "11",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "12",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }, {
            name: "13",
            file: "http://mantle.me/me.jpeg",
            type: "jpeg"
          }
        ];
        (function() {
          files = f;
          total = files.length;
          _this.ds = new kendo.data.DataSource({
            data: files,
            pageSize: 8,
            change: function() {
              var item, thumbnail, _i, _len, _ref;
              _ref = this.view();
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                item = _ref[_i];
                thumbnail = new kendo.View(nextPage, template, item);
                thumbnail.render();
              }
              return container.kendoAnimate({
                effects: animation.effects,
                face: animation.reverse ? nextPage : previousPage,
                back: animation.reverse ? previousPage : nextPage,
                duration: animation.duration,
                reverse: animation.reverse,
                complete: function() {
                  var flipping, justPaged;
                  justPaged = previousPage;
                  previousPage = nextPage;
                  nextPage = justPaged;
                  justPaged.empty();
                  return flipping = false;
                }
              });
            },
            schema: {
              model: {
                id: "name"
              }
            },
            sort: {
              dir: "desc",
              field: "name"
            }
          });
          return _this.ds.read();
        })();
        $.publish("/postman/deliver", [{}, "/file/read"]);
        $.subscribe("/gallery/delete", function() {
          return destroy();
        });
        $.subscribe("/gallery/add", function(item) {
          return add(item);
        });
        $.subscribe("/gallery/at", function(index) {
          return at(index);
        });
        return gallery;
      }
    };
  });

}).call(this);
