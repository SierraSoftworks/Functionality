var Masquerade = require('./Masquerade.js'),
	Overload = require('./Overload.js');

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