# node-flakes

A 128-bit, k-ordered, lexicographically-sortable unique ID generator. IDs sort by time, are coordination-free, and work across distributed nodes. Used by `consequent` for actor and event IDs.

## ID Structure

```
[ 64-bit timestamp ][ 48-bit node id ][ 16-bit sequence ]
```

- **Timestamp**: ms since 2020-01-01 epoch
- **Node ID**: derived from MAC address (default) or hashed from an arbitrary string
- **Sequence**: increments within the same millisecond; throws if > 65535/ms

Throughput: ~500 IDs/ms per process.

## API — Three Formats

### base62 (default choice — compact, URL-safe)

22 characters, lexicographically sortable. Use for database primary keys, URLs, any place you want a compact opaque ID.

```typescript
import { getBase62Provider } from 'node-flakes'

const nextId = getBase62Provider()        // uses host MAC address
const nextId = getBase62Provider('seed')  // hashes 'seed' for node ID portion

const id = nextId()  // e.g. '0000001JZA5GHkKpQ8mN3F'
```

### base36 (DB-safe, case-insensitive)

25 characters, uppercase only. Use when the storage system is case-insensitive or you need to avoid mixed-case IDs.

```typescript
import { getBase36Provider } from 'node-flakes'

const nextId = getBase36Provider('seed')  // node identifier required
const id = nextId()  // e.g. '0000000000001K3JH7M2QX9P4'
```

### BigInt (internal computation)

Use when you need to do math on IDs, implement custom encoding, or work with the raw value.

```typescript
import { getBigIntIdProvider, bigIntTo62, bigIntTo36 } from 'node-flakes'

const nextId = getBigIntIdProvider()   // uses host MAC address
const nextId = getBigIntIdProvider('seed')

const id: bigint = nextId()

// Convert to string formats
const base62 = bigIntTo62(id)  // 22 chars
const base36 = bigIntTo36(id)  // 25 chars
```

## Choosing a Format

| Format | Length | Use case |
|---|---|---|
| base62 | 22 chars | Primary keys, URLs, most cases |
| base36 | 25 chars | Case-insensitive storage systems |
| BigInt | native | Math, custom encoding, testing |

## Gotchas

- **MAC address dependency**: In environments without a network interface (some containers, CI), `getBase62Provider()` with no argument may fail or produce inconsistent node IDs. Always pass an explicit `nodeIdentifier` string in containerized environments.
- **Clock skew**: If the system clock moves backward (NTP correction), the generator throws `'NTP clock skew detected'`.
- **Sequence overflow**: More than 65,535 IDs in a single millisecond throws. This is extremely unlikely in practice at ~500/ms throughput.
- **Fixed epoch**: The epoch is `2020-01-01T00:00:00.000Z`. IDs generated before this date are not valid.

## Used By

- `consequent` — generates `_id` fields for actor snapshots and event records
