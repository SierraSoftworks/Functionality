var fn = require('../');

var should = require('should');


describe('bugs', function() {
	describe('RangeError for large array validations', function() {
		var lotsOfObjects = [];
		for(var i = 0; i < 100000; i++)
			lotsOfObjects.push({});

		it('should not exceed the call stack size for large array validations', function() {
			var f = fn.on([Object], function(objects) {
				return objects;
			}).compile();

			f(lotsOfObjects).should.have.property('length').and.eql(100000);
		});
	});

	describe('Object masking Array', function() {
		it('should not mask an [Object] (or similar) option if Object is also an option', function() {
			var f = fn.on(Object, fn.gobble(), function(obj) {
				return false;
			}).on([Object], fn.opt(Function), function(objs, cb) {
				return true;
			}).compile();

			f({ a: 1 }).should.be.false;
			f([{ a: 1 }]).should.be.true;
		});

		it('should not mask an [Object] (or similar) option if Object is also an option and retry() is used', function() {
			var f = fn.on(Object, fn.gobble(), function(obj) {
				return this.retry([obj]);
			}).on([Object], fn.opt(Function), function(objs, cb) {
				return true;
			}).compile();

			f({ a: 1 }).should.be.true;
			f([{ a: 1 }]).should.be.true;
		});
	});
});