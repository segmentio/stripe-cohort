
var assert = require('assert');
var cohort = require('..');
var util = require('util');

describe('stripe-cohort', function () {

  // TODO: enter your stripe key
  var key = 'stripe-key';

  describe('#cohort', function () {
    this.timeout(30000); // querying lots of customers can take a while

    it('should return a cohort of customers', function (done) {
      var self = this;
      var start = new Date('2/1/2014');
      var end = new Date('3/1/2014');
      cohort(key)(start, end, function (err, customers) {
        if (err) return done(err);
        assert(customers);
        self.customers = customers;
        done();
      });
    });
  });

  describe('#customers', function () {

    describe('#count', function () {
      it('should count the customers', function () {
        var count = this.customers.count();
        assert('number' === typeof count);
      });
    });

    describe('#list', function () {
      it('should get a list of customers', function () {
        var list = this.customers.list();
        assert(util.isArray(list));
      });

      it('should get a list of customers by created date', function () {
        var start = new Date('2/15/2014');
        var end = new Date('2/16/2014');
        var list = this.customers.list(start, end);
        assert(util.isArray(list));
      });
    });
  });


  describe('#subscriptions', function () {

    describe('#count', function () {
      it('should count the customers', function () {
        var count = this.customers.subscriptions().count();
        assert('number' === typeof count);
      });
    });

    describe('#list', function () {
      it('should get a list of subscriptions', function () {
        var list = this.customers.subscriptions().list();
        assert(util.isArray(list));
      });

      it('should get a list of subscriptions by started date', function () {
        var start = new Date('2/15/2014');
        var end = new Date('2/16/2014');
        var list = this.customers.subscriptions(start, end).list();
        assert(util.isArray(list));
      });
    });

    describe('#mrr', function () {
      it('should calculate the monthly recurring revenue of all subscription', function () {
        var mrr = this.customers.subscriptions().mrr();
        assert('number' === typeof mrr);
      });
    });

    describe('#active', function () {
      it('should calculate the monthly recurring revenue of all active subscription', function () {
        var mrr = this.customers.subscriptions().active().mrr();
        assert('number' === typeof mrr);
      });

      it('should calculate the monthly recurring revenue of all active subscription by started date', function () {
        var start = new Date('2/15/2014');
        var end = new Date('2/16/2014');
        var mrr = this.customers.subscriptions().active().mrr(start, end);
        assert('number' === typeof mrr);
      });
    });

    describe('#trialing', function () {
      it('should calculate the monthly recurring revenue of all trialing subscription', function () {
        var mrr = this.customers.subscriptions().trialing().mrr();
        assert('number' === typeof mrr);
      });
    });
  });
});