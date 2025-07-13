import test from 'node:test';
import assert from 'node:assert';
import fallback from './index.js';

test('basic fallback functionality - first callback succeeds', async () => {
  const cb1 = async (data: string) => `success: ${data}`;
  const cb2 = async (data: string) => `backup: ${data}`;
  
  const fn = fallback([cb1, cb2]);
  const result = await fn('test');
  
  assert.strictEqual(result, 'success: test');
});

test('fallback functionality - first callback fails, second succeeds', async () => {
  const cb1 = async (data: string) => {
    throw new Error('first failed');
  };
  const cb2 = async (data: string) => `backup: ${data}`;
  
  const fn = fallback([cb1, cb2]);
  const result = await fn('test');
  
  assert.strictEqual(result, 'backup: test');
});

test('all callbacks fail - throws AggregateError', async () => {
  const cb1 = async (data: string) => {
    throw new Error('first failed');
  };
  const cb2 = async (data: string) => {
    throw new Error('second failed');
  };
  
  const fn = fallback([cb1, cb2]);
  
  await assert.rejects(
    () => fn('test'),
    (error: AggregateError) => {
      assert.strictEqual(error.name, 'AggregateError');
      assert.strictEqual(error.message, 'All fallback callbacks failed');
      assert.strictEqual(error.errors.length, 2);
      assert.strictEqual((error.errors[0] as Error).message, 'first failed');
      assert.strictEqual((error.errors[1] as Error).message, 'second failed');
      return true;
    }
  );
});

test('error aggregation - maintains order of errors', async () => {
  const cb1 = async (data: string) => {
    throw new Error('error 1');
  };
  const cb2 = async (data: string) => {
    throw new Error('error 2');
  };
  const cb3 = async (data: string) => {
    throw new Error('error 3');
  };
  
  const fn = fallback([cb1, cb2, cb3]);
  
  try {
    await fn('test');
    assert.fail('Should have thrown AggregateError');
  } catch (error) {
    assert.ok(error instanceof AggregateError);
    assert.strictEqual(error.errors.length, 3);
    assert.strictEqual((error.errors[0] as Error).message, 'error 1');
    assert.strictEqual((error.errors[1] as Error).message, 'error 2');
    assert.strictEqual((error.errors[2] as Error).message, 'error 3');
  }
});

test('empty callbacks array throws error', async () => {
  const fn = fallback([]);
  
  await assert.rejects(
    () => fn('test'),
    { message: 'No callbacks provided' }
  );
});
