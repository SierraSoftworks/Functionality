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

Functionality.prototype.any = function() {
	return new Masquerade(function(value) {
		return value !== undefined && value !== null;
	});
};

Functionality.prototype.mask = function(handler) {
	return new Masquerade(handler);
};

Functionality.prototype.any = function(masks) {
	var args = Array.prototype.slice.call(arguments);
	return new Masquerade(function(value) {
		return _.any(args, function(mask) { return Masquerade.match(mask, value) });
	});
};

Functionality.prototype.not = function(masks) {
	var args = Array.prototype.slice.call(arguments);
	return new Masquerade(function(value) {
		return value !== undefined && !_.any(args, function(mask) { return Masquerade.match(mask, value) });
	});
};

Functionality.prototype.opt = function(mask) {
	return new Masquerade(function(value, next) {
		if(value === undefined || value === null) return next();
		return Masquerade.match([mask], [value]) && next();
	});
};

Functionality.prototype.gobble = function() {
	return new Masquerade(function(value, next) {
		return true;
	});
};