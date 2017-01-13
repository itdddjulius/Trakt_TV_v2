DuckieTV.factory('HTTPAPIServer', ["FavoritesService", "CalendarEvents", "$q", function(FavoritesService, CalendarEvents, $q) {

    var config = {
      httpPort: 42139
    }

    var server = null;
    var url = null; // will be require'd and initialized only when starting server
    var http = null; // will be require'd and initialized only when starting server

    var methodRouters = {

      '/api/today': function() {
          return $q(function(resolve) {
            resolve(CalendarEvents.getEvents(new Date()));
          });
      },
      '/api/favorites': function() {
          return $q(function(resolve) {
            resolve(FavoritesService.favorites);
          });
      }
    }


    var requestHandler = function(request, response) {
        try {
          var uri = url.parse(request.url).pathname;

          if((uri in methodRouters)) {

              methodRouters[uri]().then(function(json) {
                response.writeHead(200, {"Content-Type": "application/json"});
                response.write(JSON.stringify(json, null, "\t"));
                response.end();
              });

          } else {
              response.writeHead(404, {"Content-Type": "text/html"});
              response.write("<h1 style='font-family:sans-serif'>404 Not Found for route "+uri+"</h1>.<br>Here's a kitten: <br><img src='https://http.cat/404' /> \n");
              response.end();
          }
        } catch (E) {
            response.writeHead(500, {"Content-Type": "text/html"});
            response.write("<h1 style='font-family:sans-serif'>500 internal server error for route "+uri+"</h1>" +E.message +" <br> Available routes: <pre>" +JSON.stringify(Object.keys(methodRouters))+ "\n");
            response.end();
        }
    };


    var service = {
      setPort: function(port) {
        httpPort = port
      },
      start: function() {

         http = require("http"),
         url = require("url");

         server = http.createServer(requestHandler);
         server.listen(config.httpPort);
         console.info("DuckieTV API Server started on port " +config.httpPort);
         window.addEventListener('unload', service.stop);
      },
      stop: function() {
          server.close(function () {
            console.log('API Server stopped');
          });
      },


    };
    return service;
}]);

DuckieTV.run(["HTTPAPIServer", "SettingsService",
    function(HTTPAPIServer, SettingsService) {
      if (navigator.userAgent.toLowerCase().indexOf('standalone') !== -1 && SettingsService.get('apiserver.enabled')) {
        HTTPAPIServer.start();
      }
    }
]);