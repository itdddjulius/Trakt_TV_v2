DuckieTV.factory('HTTPAPIServer', ["FavoritesService", "CalendarEvents", "TraktTVv2", "TorrentSearchEngines", "SettingsService", "$q", function(FavoritesService, CalendarEvents, TraktTVv2, TorrentSearchEngines, SettingsService, $q) {

    var config = {
      httpPort: 42139
    }

    var server = null;
    /**
      * Nodejs modules, will be require'd and initialized only when starting server
      */
    var url = null; 
    var http = null; 
    var querystring = null; 

    var methodRouters = {

      '/api/calendar/today': function() {
          return $q(function(resolve) {
            resolve(FavoritesService.getEpisodesForDateRange(moment().startOf("day").toDate().getTime(),moment().endOf("day").toDate().getTime()));
          });
      },
      '/api/calendar/thismonth': function() {
        return $q(function(resolve) {
          resolve(FavoritesService.getEpisodesForDateRange(moment().startOf("month").toDate().getTime(), moment().endOf("month").toDate().getTime()));
        });
      },
      '/api/calendar/thisweek': function() {
        return $q(function(resolve) {
          resolve(FavoritesService.getEpisodesForDateRange(moment().startOf("week").toDate().getTime(), moment().endOf("week").toDate().getTime()));
        });
      },
      '/api/calendar/range':function() {

      },
      '/api/favorites': function() {
          return $q(function(resolve) {
            resolve(FavoritesService.favorites);
          });
      },
      '/api/search/serie' : function(what) {
          if(!what || !what.q) {
            throw Error('E_NO_SEARCH_QUERY_PROVIDED'); 
          }
          return TraktTVv2.search(what.q);
      },
      '/api/add/serie': function(what) {
          throw Error('E_NOT_IMPLEMENTED'); 
      },
      '/api/remove/serie': function(what) {
          if(!what) {
            throw Error('E_NOT_IMPLEMENTED'); 
          }
      },
      '/api/search/torrent' : function(what) {
        if(!what || !what.q) {
          throw Error('E_NO_TORRENT_SEARCH_QUERY_PROVIDED'); 
        }
        var engine = what.provider || SettingsService.get('torrenting.searchprovider');
        var quality = what.quality || SettingsService.get('torrenting.searchquality');

        var searchEngines = TorrentSearchEngines.getSearchEngines();
        if(!(engine in searchEngines)) {
          throw Error('E_INVALID_SEARCH_ENGINE');
        }
        return searchEngines[engine].search([what.q, quality].join(' '), undefined, 'seeders');
      },
      'api/add/torrent/magnet': function(what) {

      }
    }

    /**
     * Check if value is a CRUD.Entity and return asObject if so, otherwise return input.
     */
    function CRUDSerializer(value) {
          return (value instanceof CRUD.Entity) ? value.asObject() : value;
    }

    /**
     * JSON Serializer function that serializes all array items that contain CRUD Entities or returns the input
     */
    function CRUDSerializerVisitor(key, value) {
      return (value &&  typeof value == "object" && ('length' in value)) ? value.map(CRUDSerializer) : value;
    }


    /**
     * Handle a request and send the response
     * Hooks directly into HTTP server
     */
    requestHandler = function(request, response) {
        /**
         * Default response handler: send headers and status code, write content to output buffer and close connection. 
         * @param string content
         * @param int status http status (default 200)
         * @param object headers Http headers (default text/html)
         */
        function sendResponse(content, status, headers) {
          response.writeHead(status || 200, headers || {"Content-Type": "application/json"});
          response.write(JSON.stringify(content,  CRUDSerializerVisitor, "\t") );
          response.end(); 
        }
        try {

          var uri = url.parse(request.url);
          if((uri.pathname in methodRouters)) {
              /**
               * execute the method attached to the route, pass everything after ? as argument
               * expects a promise that returns something that can be serialized to json!
               */
              methodRouters[uri.pathname](querystring.parse(uri.query)).then(function(json) {
                // all default responses are json. Serialize the output andreturn it 
                sendResponse(json, 200);
              });

          } else {
              sendResponse({
                error: "404 Not Found for route "+uri.pathname
              }, 404);
          }
        } catch (E) {
          var errors = {
              'E_NOT_IMPLEMENTED': { message: "method not yet implemented" },
              'E_NO_QUERY_PROVIDED': { message: "No search query provided. Append '?q=yourSearchQuery' to this url.",
                  availableParameters: {
                    q: 'yourSearchQuery'
                }
              },
              'E_NO_SERIE_ID_PROVIDED': { message: "No Serie ID provided. Supply one of the available ids",
                  availableParameters: {
                    tvdbid : 'TVDB ID',
                    traktid : 'TraktTV ID'
                  }
              },
              'E_NO_TORRENT_SEARCH_QUERY_PROVIDED': { message: "No search query provided.",
                  availableParameters: {
                    q: 'yourSearchQuery',
                    provider: 'SearchEngine to use (optional)',
                    quality: 'Quality touse (optional)'
                  }
              },
              'E_INVALID_SEARCH_ENGINE': { message: "Invalid search engine provided.", 
                  availableEngines: Object.keys(TorrentSearchEngines.getSearchEngines())
              }
            };
            var msg = (E.message in errors) ? errors[E.message] : E.message;
            
            sendResponse({ 
              error: "500 Internal Server Error for route "+uri.pathname,
              detail: msg, 
              availableRoutes: Object.keys(methodRouters)
            }, 500);
        }
    };


    /**
     * Published methods
     */
    var service = {
      /**
       * Configure port to listen on
       */
      setPort: function(port) {
        httpPort = port
      },
      /**
       * Start HTTP server on listen port, kill it on page reload.
       */
      start: function() {

         http = require("http"),
         url = require("url");
         querystring = require("querystring");

         server = http.createServer(requestHandler);
         server.listen(config.httpPort);
         console.info("DuckieTV API Server started on port " +config.httpPort);
         window.addEventListener('unload', service.stop);
      },
      /**
       * Shutdown the http server.
       */
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