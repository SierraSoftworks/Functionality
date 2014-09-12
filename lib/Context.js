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
	this.result = Context.noResult;
	this.handlers = this.overload.handlers.on.slice(0);
	return Context.noResult;
};

Context.prototype.return = function(value) {
	if(this.matched && this.result === Context.noResult && value !== Context.noResult)
		this.result = value;
};