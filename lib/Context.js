module.exports = Context;

function Context(context, overload, args) {
	this.context = context;
	this.overload = overload;
	
	if(!Array.isArray(args))
		this.args = Array.prototype.slice.call(args, 0);
	else this.args = args;

	this.overloads = [];
	this.matched = false;
	this.result = Context.noResult;
}

Context.prototype.retry = function() {
	if(arguments.length)
		this.args = Array.prototype.slice.call(arguments);
	this.matched = false;
	this.result = Context.noResult;
	this.overloads = this.overload.handlers.on.slice();
	return Context.noResult;
};

Context.prototype.return = function(value) {
	if(value === undefined) return;
	if(this.result !== undefined) return;
	if(this.matched || !this.overloads.length) this.result = value;
};