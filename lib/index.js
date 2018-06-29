
var Batch = require('batch');
var Customers = require('./customers');
var debug = require('debug')('stripe-cohort');
var defaults = require('defaults');
var range = require('range-component');
var Stripe = require('stripe');
var unixTime = require('unix-time');
var util = require('util');

/**
 * Expose `Cohorter`.
 */

module.exports = Cohorter;

/**
 * Initialize a new `Cohorter` the Stripe `key`.
 *
 * @param {String} key
 * @param {Object} options
 *   @param {Number} count
 */

function Cohorter (key, options) {
  if (!(this instanceof Cohorter)) return new Cohorter(key, options);
  if (!key) throw new Error('Stripe cohort requires a Stripe key.');
  this.stripe = Stripe(key);
  this.stripe.setApiVersion('2014-03-13');
  this.options = defaults(options, { count: 100, concurrency: 1 });
  var self = this;
  return function () { self.cohort.apply(self, arguments); };
}

/**
 * Create a cohort.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {Function} callback
 */

Cohorter.prototype.cohort = function (start, end, callback) {
  if (!util.isDate(start)) throw new Error('Start must be a date.');
  if (!util.isDate(end)) throw new Error('End must be a date.');
  var self = this;
  debug('creating cohort [%s - %s] ..', start, end);
  this.customers(start, end, function (err, customers) {
    if (err) return callback(err);
    debug('created cohort');
    callback(null, new Customers(customers));
  });
};

/**
 * Load customers between a `start` and `end` date.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {Function} callback
 */

Cohorter.prototype.customers = function (start, end, callback) {
  debug('loading customers with created [%s - %s] ..', start, end);
  var self = this;
  var customers = [];
  var page = this.options.count;
  // run the first query to get the total unpaginated count
  this.query(start, end, 0, function (err, res) {
    if (err) return callback(err);
    var count = res.count;
    customers.push.apply(customers, res.data);
    var got = res.data.length;
    var left = res.count - got;
    // check if we grabbed everything in the first query
    if (0 === left) return callback(null, customers);
    // there's more, we have to paginate query
    var pages = Math.ceil(left / page);
    debug('loaded %d customers, %d left in %d pages of %d', got, left, pages, page);
    var batch = new Batch();
    batch.concurrency(self.options.concurrency);
    range(0, pages).forEach(function (i) {
      batch.push(function (done) { self.query(start, end, got + (i * page), done); });
    });
    batch.end(function (err, results) {
      if (err) return callback(err);
      results.forEach(function (res) {
        customers.push.apply(customers, res.data);
      });
      debug('finished loading all customers in cohort');
      callback(null, customers);
    });
  });
};

/**
 * List customers between a `start` and `end` date, with an `offset`.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {Number} offset
 * @param {Function} callback
 */

Cohorter.prototype.query = function (start, end, offset, callback) {
  debug('loading customers with created [%s - %s] with offset %d ..', start, end, offset);
  var options = {
    created: { gte: unixTime(start), lte: unixTime(end) },
    count: this.options.count,
    offset: offset
  };
  this.stripe.customers.list(options, function (err, res) {
    if (err) return callback(err);
    var customers = res.data;
    debug('loaded %d customers with offset %d', customers.length, offset);
    callback(null, res);
  });
};
