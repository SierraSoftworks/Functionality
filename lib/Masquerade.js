var _ = require('lodash');

module.exports = Masquerade;

function Masquerade(handler) {
	this.handler = handler;
}

Masquerade.prototype.match = function(value, next) {
	if(this.handler.length <= 1) return this.handler(value) && next();
	return this.handler(value, next);
};

Masquerade.match = function(mask, args) {
	if(!Array.isArray(mask)) {
		mask = [mask];
		args = [args];
	} else {
		mask = mask.slice(0);
		args = args.slice(0);
	}

	// Normalize masks
	mask = _.map(mask, function(m) {
		if(m instanceof Masquerade) return m;
		return Masquerade.type(m);
	});

	var next = function() {
		if(!mask.length) return !args.length;
		var m = mask.shift(), arg = args.shift();
		return m.match(arg, next);
	};

	return next();
};

Masquerade.type = function(mask) {
	return new Masquerade(function(value) {
		// String => "string"
		if(mask === String) return typeof value == 'string';
		
		// Boolean => true
		if(mask === Boolean) return typeof value == 'boolean';
		
		// Number => 1
		if(mask === Number) return typeof value == 'number';

		// Function => function() { }
		if(mask === Function) return _.isFunction(value);

		// Object => {}, new Object(), new String(), "" ...
		if(mask === Object) return _.isPlainObject(value);

		// RegExp => /regex/
		if(mask === RegExp) return _.isRegExp(value);

		// Date => new Date()
		if(mask === Date) return _.isDate(value);

		// null => null
		if(mask === null) return value === null;

		// undefined => undefined
		if(mask === undefined) return value === undefined;

		// Array => [...]
		if(mask === Array) return _.isArray(value);

		// [Number] => [1, 2, 3, 4]
		if(Array.isArray(mask) && mask.length == 1)
			return Array.isArray(value) && Masquerade.match(_.map(value, function() { return mask[0]; }), value);

		// { a: Number } => { a: 1 }
		if(_.isObject(mask))
			return _.isObject(value) && _.every(mask, function(m, key) { return Masquerade.match(m, value[key]); });

		// /regex/ => "a regex string"
		if(mask instanceof RegExp) return mask.test(value || '');

		// Masquerade => new Masquerade()
		return value instanceof mask;
	});
};