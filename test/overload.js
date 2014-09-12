var Overload = require('../lib/Overload.js');

var should = require('should');

describe('overload', function() {
	it('should work when everything is put together', function() {
		var overload = new Overload();
		var called = false;
		overload
			.first(function() {
				should.exist(this);
				should.exist(this.args);
				this.args.length.should.eql(1);
			})
			.on(String, function(s) {
				should.exist(s);
				s.should.eql('a');
				called = true;
				return 'STRING: ' + s;
			})
			.on(Number, function(n) {
				should.exist(n);
				n.should.eql(1);
				called = true;
				return 'NUMBER: ' + n;
			})
			.or(function(val) {
				should.exist(val);
				val.should.eql(true);
				called = true;
				return 'OTHER: ' + val;
			})
			.then(function() {
				called.should.be.true;
				should.exist(this);
				should.exist(this.result);
				called = false;
				return this.result;
			});

		overload.handlers.on.length.should.eql(2);

		overload.compile.should.be.type('function');

		var fn = overload.compile();
		fn.should.be.type('function');

		fn('a').should.eql('STRING: a');
		fn(1).should.eql('NUMBER: 1');
		fn(true).should.eql('OTHER: true');
	});

	it('should throw an error if no overloads match and no or() is provided', function() {
		var overload = new Overload();
		var fn = overload.on(String, function(s) {
			return s;
		}).compile();

		(function() {
			fn(1);
		}).should.throw();
	});

	it('should default to a standard then() function', function() {
		var overload = new Overload();
		var fn = overload.on(String, function(s) {
			return s;
		}).compile();

		fn('s').should.eql('s');
	});

	it('should work when only overloads are provided', function() {
		var overload = new Overload();
		overload.on(String, function(s) {
			return s;
		}).on(Number, function(n) {
			return n;
		});

		var fn = overload.compile();

		fn('s').should.eql('s');
		fn(1).should.eql(1);
	});

	it('should return the result of the then() function', function() {
		var overload = new Overload();
		overload.on(String, function(s) {
			return s;
		}).then(function() {
			return 's';
		});

		var fn = overload.compile();

		fn('a').should.eql('s');
	});
});