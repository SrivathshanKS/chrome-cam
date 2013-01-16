// Generated by CoffeeScript 1.4.0
(function() {

  define([], function(file) {
    var asyncFileRequest, pub;
    asyncFileRequest = function(requestMessage, responseMessage, data) {
      var deferred, token;
      deferred = $.Deferred();
      token = $.subscribe(responseMessage, function(result) {
        $.unsubscribe(token);
        return deferred.resolve((result || {}).message);
      });
      $.publish("/postman/deliver", [data, requestMessage, []]);
      return deferred.promise();
    };
    return pub = window.filewrapper = {
      readAll: function() {
        return asyncFileRequest("/file/read", "/pictures/bulk", {});
      },
      deleteFile: function(filename) {
        return asyncFileRequest("/file/delete", "/file/deleted/" + filename, {
          name: filename
        });
      },
      clear: function() {
        return asyncFileRequest("/file/clear", "/file/cleared", {});
      },
      save: function(filename, blob) {
        return asyncFileRequest("/file/save", "/file/saved/" + filename, {
          name: filename,
          file: blob
        });
      }
    };
  });

}).call(this);
