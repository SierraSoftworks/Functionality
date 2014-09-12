# Functionality
**Simple function overloading for JavaScript**

Have you ever wished there was a nice way to handle method overloading from within JavaScript? We certainly have
and decided to come up with a solution. Meet Functionality, a drop in solution to method overloading which avoids
many of the pitfalls of competing solutions.

## Example
It's always nice to see what you're getting into, so here's a quick example of how you can use Functionality.
The following is an excerpt from [Iridium](https://github.com/SierraSoftworks/Iridium) showing how the Model.find
method is implemented using Functionality.

```js
var fn = require('functionality');

Model.prototype.find = fn
	.first(function() {
		// Any generic setup stuff you want to be available within the handlers
		this.promise = Q.defer();

		this.addCallback = function(callback) {
			this.promise.then(function(result) { 
					return callback(null, result); 
				}, 
				function(err) { 
					return callback(err); 
				});
		}
	})
	.on(String, fn.gobble(), function(query) {
		this.args[0] = { _id: query };
		this.retry();
	}).on(Object, fn.opt(Function), function(query, callback) {
		this.query = query;
		this.project = null;
		this.options = {
			cache: true,
			wrap: true
		};

		if(callback) this.addCallback(callback);
	}).on(Object, Object, fn.opt(Function), function(query, project, callback) {
		this.query = query;
		this.project = project;
		this.options = {
			cache: true,
			wrap: true
		};

		if(callback) this.addCallback(callback);
	}).on(Object, Object, Object, fn.opt(Function), fn.gobble(), function(query, project, options, callback) {
		this.query = query;
		this.project = project;
		this.options = options;

		_.defaults(options, {
			cache: true,
			wrap: true
		});

		if(callback) this.addCallback(callback);
	}).or(function() {
		throw new Error('No overload of "find" matches the arguments you provided');
	}).then(function() {
		// Actually perform the DB query
		this.context.collection.find(this.query, this.project, this.options, (function(err, result) {
			if(err) this.promise.reject(err);
			this.promise.resolve(result);
		}).bind(this));

		return this.promise.promise;
	}).compile();
```

## How It Works


## API
Functionality's API is very simple to get used to, it is primarily built around the `on(mask, handler)` and `or(handler)` methods, but there
are a number of helpers available which allow you to do some very cool stuff with ease.

### fn.first(handler)
**Registers a handler which is called before any processing**



### fn.on(mask, mask, handler)
**Registers a handler for calls which match the given mask**

This method is the backbone of Functionality, it will register a handler which is triggered whenever the method is called with a set of parameters which match.

### fn...or(handler)
**Registers a handler which is called if no overloads matched**



### fn...then(handler)
**Registers a handler which is called after the overload handlers are finished**



### fn...compile()
**Compiles the overloads into a callable function**



### fn...execute(context, arguments)
**Runs the overloaded function, the same as calling `fn.compile().apply(context, arguments)`**



### fn.opt(mask)
**Marks an argument as optional (may be `null` or `undefined`)**



### fn.gobble()
**Consumes all arguments including and following the current one**