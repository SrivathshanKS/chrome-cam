// Generated by CoffeeScript 1.4.0
(function() {

  define(['mylibs/postman/postman', 'mylibs/utils/utils', 'mylibs/file/file', 'mylibs/localization/localization', 'mylibs/camera/camera'], function(postman, utils, file, localization, camera) {
    'use strict';

    var iframe, menu, paparazzi, pub, wrapper;
    iframe = iframe = document.getElementById("iframe");
    wrapper = $(".wrapper");
    paparazzi = $(".paparazzi", wrapper);
    window.cleanup = function() {
      return camera.cleanup();
    };
    menu = function() {
      chrome.contextMenus.onClicked.addListener(function(info, tab) {
        return $.publish("/postman/deliver", [{}, "/menu/click/" + info.menuItemId]);
      });
      return $.subscribe("/menu/enable", function(isEnabled) {
        var menus, _i, _len, _results;
        menus = ["chrome-cam-about-menu"];
        _results = [];
        for (_i = 0, _len = menus.length; _i < _len; _i++) {
          menu = menus[_i];
          _results.push(chrome.contextMenus.update(menu, {
            enabled: isEnabled
          }));
        }
        return _results;
      });
    };
    return pub = {
      init: function() {
        utils.init();
        iframe.src = "app/index.html";
        postman.init(iframe.contentWindow);
        camera.init();
        $.subscribe("/localization/request", function() {
          return $.publish("/postman/deliver", [localization, "/localization/response"]);
        });
        $.subscribe("/window/close", function() {
          return window.close();
        });
        file.init();
        menu();
        return $(iframe).focus();
      }
    };
  });

}).call(this);
