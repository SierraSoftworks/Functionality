var Context = require('./Context.js'),
	Masquerade = require('./Masquerade.js');


module.exports = Overload;

function Overload() {
	this.__frozen = false;
	this.handlers = {
		first: null,
		on: [],
		or: function() {
			throw new Error("No overload for this method accepts the arguments " + JSON.stringify(this.args));
		},
		then: function() {
			if(this.result != Context.noResult)
				return this.result;
		}
	};
}

Overload.prototype = {
	get compile() {
		var overload = this;
		return function() {
			if(!overload.handlers.on.length) throw new Error("No overload handlers registered for this method");
			overload.__frozen = true;

			return function() {
				var args = Array.prototype.slice.call(arguments);
				return overload.execute(this, args);
			};
		};
	},
	get frozen() {
		return this.__frozen;
	}
}

Overload.prototype.first = function(handler) {
	if(this.frozen) throw new Error("This overload has already been compiled and cannot be modified further");
	if(this.handlers.first) throw new Error("A handler has already been registered for this aspect of the overload");
	this.handlers.first = handler;
	return this;
};

Overload.prototype.on = function(mask, handler) {
	if(this.frozen) throw new Error("This overload has already been compiled and cannot be modified further");
	mask = Array.prototype.slice.call(arguments);
	handler = mask.pop();

	this.handlers.on.unshift(function() {
		if(Masquerade.match(mask, this.args)) {
			this.matched = true;
			return handler.apply(this, this.args);
		} return Context.noResult;
	});
	return this;
};

Overload.prototype.or = function(handler) {
	if(this.frozen) throw new Error("This overload has already been compiled and cannot be modified further");
	this.handlers.or = handler;
	return this;
};

Overload.prototype.then = function(handler) {
	if(this.frozen) throw new Error("This overload has already been compiled and cannot be modified further");
	this.handlers.then = handler;
	return this;
}

Overload.prototype.execute = function(context, args) {
	var ctx = new Context(context, this, args);
	ctx.handlers = this.handlers.on.slice(0);

	if(this.handlers.first) this.handlers.first.call(ctx);

	while(ctx.handlers.length && !ctx.matched) {
		var handler = ctx.handlers.shift();

		if(typeof handler == 'function')
			ctx.return(handler.call(ctx));
	}

	if(!ctx.matched && this.handlers.or) ctx.return(this.handlers.or.apply(ctx, ctx.args));

	if(!this.handlers.then) return;
	return this.handlers.then.call(ctx);
};