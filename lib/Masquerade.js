var _ = require('lodash');

module.exports = Masquerade;

function Masquerade(name, handler) {
	this.name = name;
	this.handler = handler;
}

Masquerade.prototype.match = function(state) {
	if(this.handler.length <= 1) {
		var result = this.handler(state.value);
		state.next();
		return result;
	} else
		return this.handler(state.value, state.next);
};

Masquerade.prototype.toString = function() {
	return this.name;
};

Masquerade.prototype.withToString = function(formatter) {
	this.toString = formatter.bind(this);
	return this;
};

Masquerade.match = function(masks, args, defaultFreeze) {
	if(!Array.isArray(masks)) {
		masks = [masks];
		args = [args];
	}

	// Normalize masks
	masks = _.map(masks, function(m) {
		return Masquerade.type(m);
	});

	var maskIndex = 0;
	var argIndex = 0;
	var state = {
		mask: masks[0],
		value: args[0],
		next: function(freeze) {
			if(freeze === undefined) freeze = defaultFreeze;
			if(!freeze) maskIndex++;
			argIndex++;

			state.mask = masks.length > maskIndex ? masks[maskIndex] : false;
			state.value = args.length > argIndex ? args[argIndex] : undefined;

			if(freeze && argIndex >= args.length) state.mask = false;

			return true;
		}.bind(state)
	};

	while(state.mask) {
		var mask = state.mask;
		if(!mask.match(state))
			return false;
	}
	
	return true;
};

Masquerade.types = [
	[String, new Masquerade("String", function(value) { return typeof value == 'string'; })],
	[Boolean, new Masquerade("Boolean", function(value) { return typeof value == 'boolean'; })],
	[Number, new Masquerade("Number", function(value) { return typeof value == 'number'; })],
	[Function, new Masquerade("Function", function(value) { return _.isFunction(value); })],
	[Object, new Masquerade("Object", function(value) { return _.isPlainObject(value); })],
	[RegExp, new Masquerade("RegExp", function(value) { return _.isRegExp(value); })],
	[Date, new Masquerade("Date", function(value) { return _.isDate(value); })],
	[Array, new Masquerade("Array", function(value) { return _.isArray(value); })]
];

Masquerade.type = function(mask) {
	if(mask instanceof Masquerade) return mask;
	if(mask === null) return new Masquerade("null", function(value) { return value === null; });
	if(mask === undefined) return new Masquerade("undefined", function(value) { return value === undefined; });
	if(mask instanceof RegExp) return new Masquerade(mask.toString(), mask.test.bind(mask));

	for(var i = 0; i < Masquerade.types.length; i++)
		if(mask === Masquerade.types[i][0]) return Masquerade.types[i][1];

	if(Array.isArray(mask) && mask.length === 1) return new Masquerade("[" + mask[0].name + "]", function(value) {
		if(!Array.isArray(value)) return false;
		if(!(mask[0] instanceof Masquerade)) mask = Masquerade.type(mask[0]);
		return Masquerade.match([mask], value, true);
	});

	if(_.isPlainObject(mask)) return new Masquerade("Deep Object", function(value) {
		// { a: Number } => { a: 1 }
		return _.isObject(value) && _.every(mask, function(m, key) { return Masquerade.match(m, value[key]); });
	});

	return new Masquerade("InstanceOf", function(value) {
		// Masquerade => new Masquerade()
		return value instanceof mask;
	});
};