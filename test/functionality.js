var fn = require('../');

var should = require('should');

describe('functionality', function() {
	it('should support using first()', function() {
		var f = fn.first(function() {
			this.x = 1;
		}).on(function(n) {
			return this.x;
		}).compile();

		f().should.eql(1);
	})
});