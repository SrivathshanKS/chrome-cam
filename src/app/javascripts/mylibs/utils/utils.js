(function() {

  define([], function() {
    /*     Utils
    
    This file contains utility functions and normalizations. this used to contain more functions, but
    most have been moved into the extension
    */
    var pub;
    return pub = {
      getAnimationFrame: function() {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
          return window.setTimeout(callback, 1000 / 60);
        };
      }
    };
  });

}).call(this);