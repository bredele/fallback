# fallback

Run async functions sequentially until one succeeds.

## Installation

```sh
npm install fallback
```

## Usage

```ts
import fallback from 'fallback';

const cb = fallback([fetchPrimary, fetchSecondary, fetchBackup]);
try {
  const result = await cb(data);
} catch (error) {
  // do something with aggregated errors when all callbacks failed
}
```


