
var Subscriptions = require('./subscriptions');
var util = require('util');

/**
 * Expose `Customers`.
 */

module.exports = Customers;

/**
 * A cohort of Stripe `customers`.
 *
 * @param {Array|Customer} customers
 * @param {Object} options
 *
 */

function Customers (customers, options) {
  this.customers = customers;
  this.options = options;
}

/**
 * Return a new `Customers` thats filtered by `start` and `end`.
 *
 * @param {Date} start
 * @param {Date} end
 * @return {Customers}
 */

Customers.prototype.created = function (start, end) {
  if (!util.isDate(start)) return this;
  if (!util.isDate(end)) end = new Date('1/1/99999');
  var s = start.getTime(), e = end.getTime();
  return new Customers(this.customers.filter(function (customer) {
    var created = customer.created * 1000;
    return created >= s && created <= e;
  }), this.options);
};

/**
 * Return a new `Customers` thats filtered by delinquent customers.
 *
 * @param {Boolean} delinquent
 * @return {Customers}
 */

Customers.prototype.delinquent = function (delinquent) {
  if (typeof delinquent !== 'boolean') delinquent = true;
  return new Customers(this.customers.filter(function (customer) {
    return customer.delinquent === delinquent;
  }), this.options);
};

/**
 * Filter customers by `fn`.
 *
 * @param {Function} fn
 * @return {Customers}
 */

Customers.prototype.filter = function (fn) {
  return new Customers(this.customers.filter(fn), this.options);
};

/**
 * Count the customers between `start` and `end`.
 *
 * @param {Date} start
 * @param {Date} end
 * @return {Number}
 */

Customers.prototype.list = function (start, end) {
  return this.created(start, end).customers;
};

/**
 * Count the customers between `start` and `end`.
 *
 * @param {Date} start
 * @param {Date} end
 * @return {Number}
 */

Customers.prototype.count = function (start, end) {
  return this.created(start, end).customers.length;
};

/**
 * Get a list of active subscriptions between `start` and `end`.
 *
 * @param {Date} start
 * @param {Date} end
 * @return {Subscriptions}
 */

Customers.prototype.subscriptions = function (start, end) {
  var all = [];
  this.customers.forEach(function (customer) {
    var subscriptions = customer.subscriptions.data;
    subscriptions.forEach(function (subscription) {
      // create a backwards reference so that we can check discount
      subscription.customer = customer;
    });
    all.push.apply(all, subscriptions);
  });
  return new Subscriptions(all, this.options).started(start, end);
};
