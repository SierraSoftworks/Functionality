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

This method lets you register a handler which is executed **before** any overload resolution takes place, it's great for setting up your handler's
execution environment.

```javascript
var delay = fn.first(function() {
	this.deferred = Q.defer();
}).on(String, function(s) {
	return Q.delay(1000).thenResolve(s);
}).on(Number, String, function(s, n) {
	return Q.delay(n).thenResolve(s);
}).compile();
```

### fn.on(mask, mask, handler)
**Registers a handler for calls which match the given mask**

This method is the backbone of Functionality, it will register a handler which is triggered whenever the method is called with a set of parameters which match.
You can create your own masks using `fn.mask(handler)`, or use any type's constructor as a validator. For more details about how masks work, take a look at the **Masks** section.

### fn...or(handler)
**Registers a handler which is called if no overloads matched**

This method allows you to override the default handler which is triggered when the provided arguments don't match any of the available options. The default one will throw an
error explaining that there are no overloads available which satisfy the requirements, but if you want to do something else this is the way you'd do it.

```javascript
var beAwesome = fn.on(function() {
	console.log("Awesome!");
}).or(function(arg1, arg2, arg3) {
	console.log("You're about %d times too awesome for this!", arguments.length);
}).compile();
```

### fn...then(handler)
**Registers a handler which is called after the overload handlers are finished**

This method allows you to override the default finalization method (which is responsible for returning the result of using `return ...` within any of your `on()` handlers)
to run some other custom logic. We use it internally when there's a large overlap in the way a function works for different inputs, using the `on()` handlers to simply prepare
their inputs for this master function.

You can access the return value of the matched handler function using `this.result` from within the handler function.

```javascript
var inspect = fn.on(String, function(s) {
	return s;
}).on(Number, function(n) {
	return n.toString;
}).on(Object, function(o) {
	return JSON.stringify(n);
}).on(Array, function(arr) {
	return JSON.stringify(arr);
}).then(function() {
	console.log(this.result);
}).compile();
```

### fn...compile()
**Compiles the overloads into a callable function**

Compiles a Functionality overload into a function which can be called as normal, it'll ensure that your current `this` is transferred into all handlers as `this.context` and that
all arguments are processed correctly.

```javascript
var sayHi = fn.on(function() {
	console.log("Hi!");
	return "Hi!";
}).compile();

sayHi(); // => "Hi!"
```

### fn...execute(context, arguments)
**Runs the overloaded function, the same as calling `fn.compile().apply(context, arguments)`**

This method lets you manually trigger the execution of an overloaded method within the given context (`this.context` within handlers) and with a specific set of arguments. It's the
same as calling `fn.compile().apply(context, arguments)` and can be useful for cases where you want to use your overloaded method as a logical segment within a parent method.

```javascript
function replace(format, placeholders) {
	fn.on(String, function(s) {
		format = s;
		placeholders = {};
	}).on(String, Object, function(s, p) {
		format = s;
		placeholders = p;
	}).execute(this, arguments);

	return format.replace(/:([\w_]+)/g, function(match, id) {
		return placeholders.hasOwnProperty(id) ? placeholders[id] : match;
	});
}
```

### fn.mask(name, handler)
**Creates a new mask option for use in your functions**

This method lets you create your own selection logic for a function's arguments, you should provide a function of the form `function(value) {}` or `function(value, next)` if you want
control over when the function yields control to the next validator. Your function should return `true` if the validator matches, and if you're accepting `next` as a parameter you
need to remember to return the result of that too.

```javascript
var between1and10 = fn.mask("Between1And10", function(value) {
	return typeof value == 'number' && value > 1 && value < 10;
});

var isEmpty = fn.mask("isEmpty", function(value, next) {
	return typeof value == 'string' && !value.length && next();
})

var startsWith1 = fn.mask("Starts With",  function(value, next) {
	return value === 1;
});
```

### fn.opt(mask)
**Marks an argument as optional (may be `null` or `undefined`)**

You can use this to wrap any other mask option, making the option optional (can be null or undefined). It works great for optional trailing arguments which you want to ensure are of
a specific type, like an optional callback.

```javascript
var fn = fn.on(String, fn.opt(Function), function(path, callback) {
	if(callback) return callback(path);
	return path;
}).compile();
```

### fn.not(mask)
**Acts as the logical inverse of the given mask (except for undefined)**

This method lets you easily reverse the behaviour of a specific mask for all defined values. So you can easily say `fn.not(String)` to match everything except a string.

```javascript
var print = fn.on(fn.not(String), function(o) {
	this.args[0] = JSON.stringify(o);
	this.retry();
}).on(String, function(s) {
	console.log(s);
}).on(String, String, function(format, s) {
	console.log(format, s);
});
```

### fn.gobble()
**Consumes all arguments including and following the current one**

Sometimes you just care about the first few arguments and really couldn't care about the rest (the way JavaScript usually works). In this case, `gobble()` is the method you want to use.
It effectively validates whether there's a value in its position or not, and forces Functionality to ignore any remaining values (and validators, if they appear after it). We use it in cases
where you want to mutate a specific parameter before re-running the overload resolution (the same as re-calling the method).

```javascript
var fn = fn.on(String, fn.gobble(), function(id) {
	this.args[0] = { _id: id };
	this.retry();
}).on(Object, fn.opt(Function), function(query, callback) {
	// Some funky stuff
});
```