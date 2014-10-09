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
	});

	it('should support using retry()', function() {
		var f = fn.on(fn.not(String), function(o) {
			return this.retry(JSON.stringify(o));
		}).on(String, function(s) {
			return s;
		}).compile();

		f('s').should.equal('s');
		f(1).should.equal('1');
		f({ a: 1 }).should.equal('{"a":1}');
	});

	describe('helpers', function() {
		describe('opt', function() {
			it('should work as advertized with a single argument', function() {
				var f = fn.on(fn.opt(Number), function(n) {
					return n === undefined || n == 1;
				}).compile();

				f().should.be.true;
				f(1).should.be.true;
				f(10).should.be.false;
			});

			it('should work as advertized with multiple arguments', function() {
				var f = fn.on(String, fn.opt(Number), function(s, n) {
					s.should.eql('s');
					return n === undefined || n == 1;
				}).compile();

				f('s').should.be.true;
				f('s', 1).should.be.true;
				f('s', 10).should.be.false;
			});

			it('should not match arguments of a different type', function() {
				var f = fn.on(fn.opt(Number), function() {
					return false;
				}).or(function() {
					return true;
				}).compile();

				f().should.be.false;
				f(1).should.be.false;
				f(10).should.be.false;
				f('10').should.be.true;
			});
		});

		describe('gobble', function() {
			it('should work as advertized with a single argument', function() {
				var f = fn.on(fn.gobble(), function(n) {
					return true;
				}).or(function() {
					return false;
				}).compile();

				f().should.be.true;
				f(1).should.be.true;
				f("test", 1, 2, 3, 4).should.be.true;
			});

			it('should work as advertized with multiple arguments', function() {
				var f = fn.on(String, fn.gobble(), function(n) {
					return true;
				}).or(function() {
					return false;
				}).compile();

				f().should.be.false;
				f(1).should.be.false;
				f("test", 1, 2, 3, 4).should.be.true;
			});
		});

		describe('not', function() {
			it('should work as advertized with a single argument', function() {
				var f = fn.on(fn.not(Number), function(n) {
					return true;
				}).or(function(n) {
					return false;
				}).compile();

				f().should.be.false;
				f(1).should.be.false;
				f("test").should.be.true;
			});

			it('should work as advertized with multiple arguments', function() {
				var f = fn.on(String, fn.not(Number), function(n) {
					return true;
				}).or(function(n) {
					return false;
				}).compile();

				f('test').should.be.false;
				f('test', 1).should.be.false;
				f('test', "test").should.be.true;
			});
		});
	});
});