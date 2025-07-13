# fallback

Run async functions in order until one succeeds

## Installation

```sh
npm install @bredele/fallback
```

## Usage

### Basic Usage

```ts
import fallback from '@bredele/fallback';

const cb = fallback([asyncCb1, asyncCb2, asyncCb3]);

await cb(data);
```

### With Cancellation

Individual callbacks can handle their own cancellation using AbortSignal:

```ts
import fallback from '@bredele/fallback';

const controller = new AbortController();

const fetchFromPrimary = async (data: string) => {
  const response = await fetch('/api/primary', {
    signal: controller.signal,
    // ... other options
  });
  return response.json();
};

const fetchFromSecondary = async (data: string) => {
  const response = await fetch('/api/secondary', {
    signal: controller.signal,
    // ... other options  
  });
  return response.json();
};

const cb = fallback([fetchFromPrimary, fetchFromSecondary]);

// Cancel individual operations if needed
// controller.abort();

await cb(data);
```

## Error Handling

If all callbacks fail, an `AggregateError` is thrown containing all the individual errors:

```ts
import fallback from '@bredele/fallback';

const fetchFromPrimary = async (data: string) => {
  throw new Error('Primary server down');
};

const fetchFromSecondary = async (data: string) => {
  throw new Error('Secondary server timeout');
};

const cb = fallback([fetchFromPrimary, fetchFromSecondary]);

try {
  await cb('test-data');
} catch (error) {
  if (error instanceof AggregateError) {
    console.log('All fallbacks failed:');
    error.errors.forEach((err, index) => {
      console.log(`  Callback ${index + 1}: ${err.message}`);
    });
    // Output:
    // All fallbacks failed:
    //   Callback 1: Primary server down
    //   Callback 2: Secondary server timeout
  }
}
```
