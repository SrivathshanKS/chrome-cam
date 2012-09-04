// Generated by CoffeeScript 1.3.3
(function() {

  define(['mylibs/utils/utils', 'text!mylibs/gallery/views/gallery.html', 'text!mylibs/gallery/views/details.html'], function(utils, templateSource, detailsTemplateSource) {
    var createDetailsViewModel, createPage, detailsTemplate, loadImages, numberOfRows, pub, rowLength, setupSubscriptionEvents, template;
    template = kendo.template(templateSource);
    detailsTemplate = kendo.template(detailsTemplateSource);
    rowLength = 4;
    numberOfRows = 4;
    loadImages = function() {
      var deferred, token;
      deferred = $.Deferred();
      token = $.subscribe("/pictures/bulk", function(result) {
        var dataSource;
        if (result.message && result.message.length > 0) {
          $.publish("/bar/preview/update", [
            {
              thumbnailURL: result.message[result.message.length - 1].file
            }
          ]);
        }
        $.unsubscribe(token);
        dataSource = new kendo.data.DataSource({
          data: result.message,
          pageSize: rowLength * numberOfRows,
          change: function() {
            return $.publish("/gallery/page", [dataSource]);
          },
          sort: {
            dir: "desc",
            field: "name"
          }
        });
        dataSource.read();
        return deferred.resolve(dataSource);
      });
      $.publish("/postman/deliver", [{}, "/file/read", []]);
      return deferred.promise();
    };
    createPage = function(dataSource, $container) {
      var i, rows;
      rows = (function() {
        var _i, _results;
        _results = [];
        for (i = _i = 0; 0 <= numberOfRows ? _i < numberOfRows : _i > numberOfRows; i = 0 <= numberOfRows ? ++_i : --_i) {
          _results.push(dataSource.view().slice(i * rowLength, (i + 1) * rowLength));
        }
        return _results;
      })();
      return $container.html(template({
        rows: rows
      }));
    };
    createDetailsViewModel = function(message) {
      return $.extend({}, message, {
        deleteItem: function() {
          var deleteToken,
            _this = this;
          deleteToken = $.subscribe("/file/deleted/" + message.name, function() {
            $.unsubscribe(deleteToken);
            return _this.close();
          });
          return $.publish("/postman/deliver", [
            {
              name: message.name
            }, "/file/delete", []
          ]);
        },
        close: function() {
          return $.publish("/gallery/details/hide");
        }
      });
    };
    setupSubscriptionEvents = function($container) {
      kendo.fx.hide = {
        setup: function(element, options) {
          return $.extend({
            height: 25
          }, options.properties);
        }
      };
      $.subscribe("/gallery/details/hide", function() {
        return $container.find(".details").kendoStop(true).kendoAnimate({
          effects: "zoomOut",
          hide: true
        });
      });
      $.subscribe("/gallery/details/show", function(message) {
        var $details, model;
        model = createDetailsViewModel(message);
        $container.find(".details").remove();
        $details = $(detailsTemplate(model));
        kendo.bind($details, model);
        $container.append($details);
        return $details.kendoStop(true).kendoAnimate({
          effects: "zoomIn",
          show: true
        });
      });
      $.subscribe("/gallery/hide", function() {
        console.log("hide gallery");
        $("#footer").animate({
          "margin-top": "-60px"
        });
        return $("#wrap").kendoStop(true).css({
          height: "100%"
        }).kendoAnimate({
          effects: "expand",
          show: true,
          duration: 1000,
          complete: function() {
            $.publish("/camera/pause", [false]);
            $.publish("/bar/gallerymode/hide");
            return $container.hide();
          }
        });
      });
      $.subscribe("/gallery/list", function() {
        console.log("show gallery");
        $.publish("/camera/pause", [true]);
        $container.show();
        $("#footer").animate({
          "margin-top": 0
        });
        return $("#wrap").kendoStop(true).kendoAnimate({
          effects: "expand",
          reverse: true,
          hide: true,
          duration: 1000,
          complete: function() {
            return $.publish("/bar/gallerymode/show");
          }
        });
      });
      return $.subscribe("/gallery/page", function(dataSource) {
        return createPage(dataSource, $container);
      });
    };
    return pub = {
      init: function(selector) {
        var $container;
        $container = $(selector);
        return loadImages().done(function(dataSource) {
          var changePage;
          console.log("done loading images");
          $container.on("click", ".thumbnail", function() {
            var $media;
            $media = $(this).children().first();
            return $.publish("/gallery/details/show", [
              {
                src: $media.attr("src"),
                type: $media.data("media-type"),
                name: $media.data("file-name")
              }
            ]);
          });
          changePage = function(direction) {
            if (direction > 0 && dataSource.page() > 1) {
              dataSource.page(dataSource.page() - 1);
            }
            if (direction < 0 && dataSource.page() < dataSource.totalPages()) {
              return dataSource.page(dataSource.page() + 1);
            }
          };
          $container.kendoMobileSwipe(function(e) {
            return changePage((e.direction === "right") - (e.direction === "left"));
          });
          $.subscribe("/events/key/arrow", function(e) {
            return changePage((e === "down") - (e === "up"));
          });
          setupSubscriptionEvents($container);
          $.subscribe("/gallery/add", function(file) {
            return dataSource.add(file);
          });
          return $.publish("/gallery/page", [dataSource]);
        });
      }
    };
  });

}).call(this);
