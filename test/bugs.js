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
});