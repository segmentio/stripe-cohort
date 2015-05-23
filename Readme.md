
# stripe-cohort

  Create [Stripe](https://stripe.com) customer cohorts for a useful business overview.

### Overview

If you're interested in getting a cohort based overview of your Stripe customers, then this library might be of help.

It currently supports the following stats (by cohort):

- Total number of customers
- Monthly recurring revenue 
- Number of subscriptions
- Subscriptions by plan

## Installation

    $ npm install stripe-cohort

## Example

Create a new Stripe cohort (by the customer's `created` date):

```js
cohort(new Date('1/1/2014'), new Date('2/1/2014'), function (err, customers) {
  console.log(customers.count() + ' created in January!');
});
```

And the returned `customers` object lets you dive deeper into the cohort.

#### Options

You can include options as the second param when initializing a cohort.

  * `ignoreStripeFees` (default:false) If `true`, this will include the Stripe fees in your MRR.

#### Number of Customers

You can query the total amount of customers returned:

```js
customers.count();
```

or filter further inside the cohort by the customers' `created` date:

```js
customers.count(new Date('1/15/2014'), new Date('1/24/2014'));
```

#### Customer List

```js
customers.list()
```
```js
[
  {
    id: 'cus_2983jd92d2d',
    name: 'Patrick Collison',
    ..
  },
]
```
or filter further by the customers' `created` date:

```js
customers.list(new Date('1/15/2014'), new Date('1/24/2014'));
```

or get all the `delinquent` customers:

```js
customers.delinquent().count();
```

#### Subscriptions

You can learn about your active subscriptions too:

```js
customers.subscriptions().count();
```

Or the ones created between the date provided:

```js
customers.subscriptions(new Date('1/15/2014'), new Date('1/24/2014')).count();
```

Or just get the list of Stripe subscription objects:

```js
var objects = customers.subscriptions().list();
```

#### Monthly Recurring Revenue

You can get the monthly recurring revenue from the active subscriptions on the customers:

```js
customers.subscriptions().active().mrr();
```

And for the trialing accounts:

```js
customers.subscriptions().trialing().mrr();
```

And for any status really:

```js
customers.subscriptions().status('unpaid').mrr();
```

And you can query the monthly recurring revenue  by subscription `start` within a cohort: 

```js
customers.subscriptions().active().mrr(new Date('1/15/2014'), new Date('1/16/2014'));
```

Remember that the montly recurring revenue does not equal charges. For example, if a customer upgrades from a $29 plan to a $79 plan today, they will pro-rated for the rest of their billing period. That means you did not make the $79 yet, but you'll make the difference next month. For hard cash, use [stripe-charges](https://github.com/segmentio/stripe-charges).

#### Plans

It's also interesting to know what plans the subscriptions are being set at. You can select the subscriptions that fall under that plan:

```js
var mrr = customers.subscriptions().active().plan('startup').mrr();
console.log('We made $' + mrr + ' off the startup plan!');
```

## License

MIT
