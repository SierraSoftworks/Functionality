module.exports = Context;

function Context(context, overload, args) {
	this.context = context;
	this.overload = overload;
	
	if(!Array.isArray(args))
		this.args = Array.prototype.slice.call(args, 0);
	else this.args = args;

	this.handlers = [];
	this.matched = false;
	this.result = Context.noResult;
}

Context.noResult = new Object();

Context.prototype.retry = function() {
	this.matched = false;
	this.handlers = overload.handlers.on.concat(overload.handlers.or, overload.handlers.then);
};

Context.prototype.return = function(value) {
	if(this.result === Context.noResult && value !== Context.noResult)
		this.result = value;
};