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

## Requirements

- Node.js 18 or newer

## API

### `getBase62Provider()`

Returns a function that creates base62 ids that sort lexicographically by time.

```javascript
const { getBase62Provider } = require('node-flakes');

const nextId = getBase62Provider();
const id = nextId();
```

```typescript
import { getBase62Provider } from 'node-flakes';

const nextId = getBase62Provider();
const id = nextId();
```

### `getBigIntIdProvider()`

Returns a function that creates bigint ids ordered by time.

```javascript
const { getBigIntIdProvider } = require('node-flakes');

const nextId = getBigIntIdProvider();
const id = nextId();
```

### `getBigIntIdProviderFromMac(macNumber: bigint)`

Uses a provided 48-bit node id (MAC address) to seed the generator.

```javascript
const { getBigIntIdProviderFromMac } = require('node-flakes');

const nextId = getBigIntIdProviderFromMac(0x112233445566n);
const id = nextId();
```

### `bigIntTo62(num: bigint)`

Converts a bigint into a 22-character base62 id that preserves lexicographic order.

```javascript
const { bigIntTo62 } = require('node-flakes');

const id = bigIntTo62(123456789n);
```

### Speed
Looks like this tops out around 500 / ms on comodity processors. Do with that what you will :)

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
