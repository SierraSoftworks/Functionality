var Context = require('./Context.js'),
	Masquerade = require('./Masquerade.js');


module.exports = Overload;

function Overload() {
	this.__frozen = false;
	var handlers = this.handlers = {
		first: null,
		on: [],
		or: function() {
			var error = "No overload for this method accepts the arguments (" + this.args.map(JSON.stringify).join(',') + ")\n";
			error += "Available Overloads:\n";
			for(var i = 0; i < handlers.on.length; i++)
				error += '(' + handlers.on[i].masks.join(', ') + ')\n';
			throw new Error(error);
		},
		then: function() {
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

Overload.prototype.on = function(masks, handler) {
	if(this.frozen) throw new Error("This overload has already been compiled and cannot be modified further");
	masks = Array.prototype.slice.call(arguments);
	handler = masks.pop();
	masks = masks.map(Masquerade.type);

	this.handlers.on.unshift({
		masks: masks,
		handler: handler
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
	ctx.overloads = this.handlers.on.slice();

	if(this.handlers.first) this.handlers.first.call(ctx);

	while(ctx.overloads.length && !ctx.matched) {
		var overload = ctx.overloads.shift();

		if(Masquerade.match(overload.masks, ctx.args)) {
			ctx.matched = true;
			ctx.return(overload.handler.apply(ctx, ctx.args));
		}
	}

	if(!ctx.matched && typeof this.handlers.or == 'function')
		ctx.return(this.handlers.or.apply(ctx, ctx.args));
	
	if(!this.handlers.then) return;
	return this.handlers.then.call(ctx);
};