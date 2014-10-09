var Masquerade = require('./Masquerade.js'),
	Overload = require('./Overload.js');

var _ = require('lodash');

module.exports = Functionality;

function Functionality() {

}

Functionality.prototype.first = function() {
	var overload = new Overload();
	return overload.first.apply(overload, arguments);
};

Functionality.prototype.on = function() {
	var overload = new Overload();
	return overload.on.apply(overload, arguments);
};

Functionality.prototype.mask = function(name, handler) {
	return new Masquerade(name, handler);
};

Functionality.prototype.any = function() {
	var args = Array.prototype.slice.call(arguments).map(Masquerade.type);
	return new Masquerade("Any", function(value) {
		if(args.length === 0) return value !== undefined && value !== null;
		return _.any(args, function(mask) { return Masquerade.match(mask, value) });
	}).withToString(function() {
		if(args.length) return "Any " + args.join(' or ');
		return "Any";
	});
};

Functionality.prototype.not = function() {
	var args = Array.prototype.slice.call(arguments).map(Masquerade.type);
	return new Masquerade("Not", function(value) {
		return value !== undefined && !_.any(args, function(mask) { return Masquerade.match([mask], [value]); });
	}).withToString(function() {
		return "Not " + args.join(' or ');
	});
};

Functionality.prototype.opt = function(mask) {
	return new Masquerade("Optional", function(value, next) {
		if(value === undefined || value === null) return next();
		if(Masquerade.match([mask], [value])) return next();
		return next(true);
	}).withToString(function() {
		return "Optional " + Masquerade.type(mask);
	});
};

Functionality.prototype.gobble = function(type) {
	return new Masquerade("Gobble", function(value, next) {
		if(type === undefined || Masquerade.match([type], [value])) return next(true);
	});
};