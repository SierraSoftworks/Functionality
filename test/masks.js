var Masquerade = require('../lib/Masquerade.js');

var should = require('should');

describe('mask', function() {
	it('should correctly handle single masks', function() {
		Masquerade.match(String, "test").should.be.true;
		Masquerade.match(String, 1).should.be.false;
	});

	it('should correctly handle complex masks', function() {
		Masquerade.match([String, Number], ["test", 1]).should.be.true;
		Masquerade.match([String, Number], ["test", "1"]).should.be.false;
	});

	it('should support typed arrays', function() {
		Masquerade.match([[String]], [[1,2,3]]).should.be.false;
		Masquerade.match([[Number]], [[1,2,3]]).should.be.true;
	});

	it('should support deep objects', function() {
		Masquerade.match({ a: Number, b: String }, { a: 1, b: 'true' }).should.be.true;
		Masquerade.match({ a: Number, b: String }, { a: 1, b: 2 }).should.be.false;
	});

	it('should use undefined for all missing values', function() {
		Masquerade.match([String, undefined], ["test"]).should.be.true;

		var optional = function(type) {
			return new Masquerade(function(value) {
				return value === undefined || Masquerade.match([type], [value]);
			});
		};

		Masquerade.match([String, optional(String), optional(String)], ["test", "test"]).should.be.true;
	});

	describe('types', function() {
		it('should support Strings', function() {
			Masquerade.match(String, "str").should.be.true;
			Masquerade.match(String, 1).should.be.false;
			Masquerade.match(String, new Date()).should.be.false;
			Masquerade.match(String, /regex/).should.be.false;
			Masquerade.match(String, []).should.be.false;
			Masquerade.match(String, {}).should.be.false;
			Masquerade.match(String, true).should.be.false;
			Masquerade.match(String, { a: 1 }).should.be.false;
		});

		it('should support Numbers', function() {
			Masquerade.match(Number, "str").should.be.false;
			Masquerade.match(Number, 1).should.be.true;
			Masquerade.match(Number, new Date()).should.be.false;
			Masquerade.match(Number, /regex/).should.be.false;
			Masquerade.match(Number, []).should.be.false;
			Masquerade.match(Number, {}).should.be.false;
			Masquerade.match(Number, true).should.be.false;
			Masquerade.match(Number, { a: 1 }).should.be.false;
		});

		it('should support Dates', function() {
			Masquerade.match(Date, "str").should.be.false;
			Masquerade.match(Date, 1).should.be.false;
			Masquerade.match(Date, new Date()).should.be.true;
			Masquerade.match(Date, /regex/).should.be.false;
			Masquerade.match(Date, []).should.be.false;
			Masquerade.match(Date, {}).should.be.false;
			Masquerade.match(Date, true).should.be.false;
			Masquerade.match(Date, { a: 1 }).should.be.false;
		});

		it('should support RegExps', function() {
			Masquerade.match(RegExp, "str").should.be.false;
			Masquerade.match(RegExp, 1).should.be.false;
			Masquerade.match(RegExp, new Date()).should.be.false;
			Masquerade.match(RegExp, /regex/).should.be.true;
			Masquerade.match(RegExp, []).should.be.false;
			Masquerade.match(RegExp, {}).should.be.false;
			Masquerade.match(RegExp, true).should.be.false;
			Masquerade.match(RegExp, { a: 1 }).should.be.false;
		});

		it('should support Arrays', function() {
			Masquerade.match(Array, "str").should.be.false;
			Masquerade.match(Array, 1).should.be.false;
			Masquerade.match(Array, new Date()).should.be.false;
			Masquerade.match(Array, /regex/).should.be.false;
			Masquerade.match(Array, []).should.be.true;
			Masquerade.match(Array, {}).should.be.false;
			Masquerade.match(Array, true).should.be.false;
			Masquerade.match(Array, { a: 1 }).should.be.false;
		});

		it('should support Objects', function() {
			Masquerade.match(Object, "str").should.be.false;
			Masquerade.match(Object, 1).should.be.false;
			Masquerade.match(Object, new Date()).should.be.false;
			Masquerade.match(Object, /regex/).should.be.false;
			Masquerade.match(Object, []).should.be.false;
			Masquerade.match(Object, {}).should.be.true;
			Masquerade.match(Object, true).should.be.false;
			Masquerade.match(Object, { a: 1 }).should.be.true;
		});

		it('should support Booleans', function() {
			Masquerade.match(Boolean, "str").should.be.false;
			Masquerade.match(Boolean, 1).should.be.false;
			Masquerade.match(Boolean, new Date()).should.be.false;
			Masquerade.match(Boolean, /regex/).should.be.false;
			Masquerade.match(Boolean, []).should.be.false;
			Masquerade.match(Boolean, {}).should.be.false;
			Masquerade.match(Boolean, true).should.be.true;
			Masquerade.match(Boolean, { a: 1 }).should.be.false;
		});

		it('should support RegExp masks', function() {
			Masquerade.match(/^str$/, "str").should.be.true;
			Masquerade.match(/^str$/, "astr").should.be.false;
			Masquerade.match(/^str$/, 1).should.be.false;
			Masquerade.match(/^str$/, new Date()).should.be.false;
			Masquerade.match(/^str$/, /regex/).should.be.false;
			Masquerade.match(/^str$/, []).should.be.false;
			Masquerade.match(/^str$/, {}).should.be.false;
			Masquerade.match(/^str$/, true).should.be.false;
			Masquerade.match(/^str$/, { a: 1 }).should.be.false;
		});
	});

	describe('custom handlers', function() {
		it('should work correctly with basic validators', function() {
			var validator = new Masquerade(function(value) {
				return typeof value == 'number' && value >= 10 && value <= 100;
			});

			Masquerade.match(validator, "test").should.be.false;
			Masquerade.match(validator, 10).should.be.true;
			Masquerade.match(validator, 9).should.be.false;
			Masquerade.match(validator, 1000).should.be.false;
		});

		it('should work correctly with greedy validators', function() {
			var gobble = new Masquerade(function(value, next) {
				return true;
			});

			Masquerade.match([String, gobble], ["test"]).should.be.true;
			Masquerade.match([String, gobble], ["test", 1, 2, 3]).should.be.true;
			Masquerade.match([Number, gobble], ["test", 1, 2, 3]).should.be.false;
		});
	});
});