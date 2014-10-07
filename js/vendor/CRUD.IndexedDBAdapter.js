CRUD.IndexedDBAdapter = function(database, dbOptions) {
	this.databaseName = database;
	this.dbOptions = dbOptions
	this.lastQuery = false;
	this.db = false;
	this.fixturesQueue = [];

	CRUD.ConnectionAdapter.apply( this, arguments );
	
	this.Init = function() {
		var that = this;
		return new Promise(function(resolve, fail) {
			var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
			var e  = indexedDB.open(that.databaseName, Number(1));
			e.onupgradeneeded = that.verifyTables.bind(that);
			e.onsuccess = function(e) {
				that.db = e.target.result;
				that.db.execute = function() { 
					console.log("Trying to execute an sql query on indexeddb! not supported!", arguments); 
				}
				CRUD.log("IndexedDB connection created to ", that.databaseName);
				that.importFixtures().then(function() {
					resolve();					
				});
			};
			e.onerror = function(e) { fail(e.target.error) }
		});
	};

	this.importFixtures = function() {
		var pq = [];
		for( var i =0; i<this.fixturesQueue.length; i++) {
			var entity = CRUD.EntityManager.entities[this.fixturesQueue[i]]
			CRUD.log(entity.fixtures.length + ' Fixtures found for '+entity.className+' inserting.')
			for(var j=0; j<entity.fixtures.length; j++) {
				pq.push(CRUD.fromCache(entity.className, entity.fixtures[j]).Persist(true, 'INSERT'));
			}
		}
		return Promise.all(pq);
	};

	this.verifyTables = function(e) {
		CRUD.log('verifying that tables are in sync');
		this.db = e.target.result;
        for(var i in CRUD.EntityManager.entities) {
			var entity = CRUD.EntityManager.entities[i];
			CRUD.log("Creating objectstore for ", entity.className);
			if(!(this.db.objectStoreNames.contains(entity.className))) {
				var store = this.db.createObjectStore(entity.className, {
	                keyPath: entity.primary,
	                autoIncrement: true
	            });
	           	store.createIndex(entity.primary,entity.primary, {unique:true});	
	            
	            for(var key in entity.indexes) {
	            	store.createIndex(entity.indexes[key],entity.indexes[key], {unique:false});	
	            }
	            if(entity.fixtures && entity.fixtures.length > 0) {
	            	this.fixturesQueue.push(entity.className);
				}
				for(var related in entity.relations) {
					switch(entity.relations[related]) {
						case CRUD.RELATION_SINGLE:
						case CRUD.RELATION_FOREIGN:
							var rel = CRUD.EntityManager.entities[related];
							if( CRUD.EntityManager.entities[related]) {
								if(rel && rel.primary) {
									CRUD.log("Creating indexes for relation keys: ",related, rel.primary);
									store.createIndex(rel.primary,rel.primary, {unique:false});	
								}
							}
						break;
					}
				}
	         
	        }
        }
    }
	
	this.Find = function(what, filters, sorting, justthese, options, filters) {

		var that = this;
	
		CRUD.log("Executing query via Indexeddbadapter: ", what, filters);
	
		return new Promise(function(resolve, fail) {
			//var key = primary key of entity by default
			// check if filters are passed and if it exists in ObjectStore.indexNames
			// if so, use that
			// open a cursor on the object
			var keyName = null;
			var transaction = that.db.transaction(what,'readonly');
			var store = transaction.objectStore(what); 

			if(Object.keys(filters).length > 0) {
				if(!('length' in filters)) {
					Object.keys(filters).map(function(el) {
						if(store.indexNames.contains(el)) {
							keyName = el;
							console.log("Found a custom key to use in query!");
						}
					})
				} else {
					keyName = CRUD.EntityManager.entities[what].primary;
					console.log("Custom query -> switchign to main index:", keyName);
				}
			}

			if(keyName !== null) {
				request = store.index(keyName).openCursor();
			} else {
				request = store.index(CRUD.EntityManager.entities[what].primary).openCursor();
			}
			var output = [];
                
			request.onsuccess = function(event) {
				console.log("Query result for ", keyName, event.target[keyName], filters, event.target);
				if(event.target.result) {
					if(filters) {
						if('length' in filters) {
							for(var i=0; i< filters.length; i++) {
								var parts = filters[i].split(' AND ');
								var matches = 0;
								for(var j = 0; j< parts.length; j++) {
									console.log("Filter expression!" , parts[j]);
									var filter = parts[j].split(' ');
									// very naive stuff happening here.
									switch(filter[1]) {
										case '>':
											matches += event.target.result.value[filter[0]] > parseInt(filter[2],10) ? 1 : 0;
										break;
										case '<':
											matches += event.target.result.value[filter[0]] < parseInt(filter[2],10) ? 1 : 0;
										break;
										case '=':
											matches += event.target.result.value[filter[0]] == filter[2] ? 1 : 0;
										break;
										case 'in':
											if(filter[2] == '()') {
											 matches += 1;
											} 
											else {
												debugger;
												// todo
											}
										break;
									}
								}
								if(matches == parts.length) {
									console.log("OFMG its a match xD", matches, parts, event.target.result.value)
								}
							}
						} else {
						Object.keys(filters).map(function(key) {
								if(event.target.result.value[key] == filters[key]) {
									output.push(new window[what]().importValues(event.target.result.value));
								}
							})
						}
					} else {
						output.push(new window[what]().importValues(event.target.result.value));
					}	
                	if('continue' in event.target.result) {
                    	event.target.result.continue();
                    } else {
                    	resolve(output); // return items
                    }	
                }
                	
			};
			
			request.onerror = function(e) {
				CRUD.log('IndexeDB Error in FIND : ',e, what, this);
				debugger;
				fail();
			}
			
		});
	}

	this.Persist = function(what, forceInsert) {
		console.log("Persisting! ", what,forceInsert);
		var that = this;
		var trans = this.db.transaction(what.className,'readwrite');
        var store = trans.objectStore(what.className);
        var newValues = what.values;
        for(var i in what.changedValues) {
        	newValues[i] = what.changedValues[i];
        } 
        for(var j in what.defaultValues) {
        	if(!(j in newValues)) {
        		newValues[j] = what.defaultValues[j];
        	}
        }
        return new Promise(function(resolve, fail) {
        	var request = store.put(newValues);
	        request.onsuccess = resolve;
	        request.onerror = fail;
        });
	}

	this.Delete = function(what, events) {
		var query = [], values = [], valmap = [], names=[], that=this;
		var trans = this.db.transaction([what], 'readwrite');
        var store = trans.objectStore(what);
		if(what.getID() !== false) {
			return new Promise(function(resolve, fail) {
				var request = store.delete(what.getID());
				request.onsuccess = function(e) {
					e.Action = 'deleted';
					resolve(e);
				};
				request.onerror = function(e) {
					CRUD.log("error deleting element from db: ", e);
					fail(e);
				};
			});
		} else {
			return new Promise(function(resolve, fail) { fail(); });
		}
	}

	return this;
};