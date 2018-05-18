# node-flakes

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![Version npm][version-image]][version-url]
[![npm Downloads][downloads-image]][downloads-url]
[![Dependencies][dependencies-image]][dependencies-url]

The Node identity lib that provides:

 * Coordination free
 * 128 bit keys
 * K-ordered
 * Lexicographically sortable
 * base 62

### Break down
128 bit key comprised of the following:

`{timestamp}{worker}{sequence}`

 * 64 bit timestamp
 * 48 bit worker id
 * 16 bit sequence number

The sequence number increments for each subsequent id requested within the same millisecond.

## API

### `require('node-flakes')`

Requiring `node-flakes` returns a function. Even when required and executed multiple times the same instance gets returned. This is worth noting so that you don't have to go through extra effort to pass around the seed value or continue to re-initialize it every time.

### Using MACAddress or HostName as seed

If no seed is provided, you can use `seedFromEnvironment` to use either the MAC address or host name plus the process id as the seed. This may not prevent duplicate seeds or id collisions, because of scenario where duplicate MACs or host names in your environment can occur.

```javascript
const flakes = require('node-flakes')();
flakes.seedFromEnvironment() // this call returns a promise and can be awaited if in an async call
  .then(
    () => {
      const id = flakes.create(); // ta-da
    }
  );
```

### Unique seeds

Anything can seed the node id. node-flakes uses farmhash to create a unique 32 bit integer from whatever you have lying around. This needs to be unique for every instance creating ids.

```javascript
const flakes = require('node-flakes')('Hey, look, a (terrible) string based seed.');
const id = flakes.create(); // ta-da
```

### Speed
Looks like this tops out around 20 / ms on modern processors. Do with that what you will :)

[travis-image]: https://travis-ci.org/arobson/node-flakes.svg?branch=master
[travis-url]: https://travis-ci.org/arobson/node-flakes
[coveralls-url]: https://coveralls.io/github/arobson/node-flakes?branch=master
[coveralls-image]: https://coveralls.io/repos/github/arobson/node-flakes/badge.svg?branch=master
[version-image]: https://img.shields.io/npm/v/node-flakes.svg?style=flat
[version-url]: https://www.npmjs.com/package/node-flakes
[downloads-image]: https://img.shields.io/npm/dm/node-flakes.svg?style=flat
[downloads-url]: https://www.npmjs.com/package/node-flakes
[dependencies-image]: https://img.shields.io/david/arobson/node-flakes.svg?style=flat
[dependencies-url]: https://david-dm.org/arobson/node-flakes
