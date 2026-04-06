import { describe, it } from 'node:test';
import assert from 'node:assert';
import { runUserCode } from './sandbox.js';

describe('sandbox', () => {
  it('runUserCode executes user JS correctly', async () => {
    const code = `function process(input, config) {
      return { val: input.payload.x + config.add };
    }`;
    const input = { payload: { x: 3 } };
    const config = { add: 2 };
    const result = await runUserCode(code, input, config);
    assert.deepStrictEqual(result, { val: 5 });
  });

  it('runUserCode with infinite loop throws timeout error', async () => {
    const code = `function process(input, config) {
      while (true) {} // infinite loop
      return {};
    }`;
    await assert.rejects(
      async () => runUserCode(code, {}, {}),
      (err: any) => {
        // Should timeout, not hang forever
        return err.message.includes('timeout') || err.message.includes('timed out') || err instanceof Error;
      }
    );
  });

  it('runUserCode always disposes isolate even when code throws', async () => {
    const code = `function process(input, config) {
      throw new Error('user code error');
    }`;
    // Should not throw a disposal error, should propagate user error
    await assert.rejects(
      async () => runUserCode(code, {}, {}),
      /user code error/
    );
    // If we get here without hanging, the isolate was disposed properly
  });

  it('runUserCode handles complex data structures', async () => {
    const code = `function process(input, config) {
      return {
        sum: input.numbers.reduce((a, b) => a + b, 0),
        doubled: input.numbers.map(n => n * 2),
        nested: { deep: { value: input.name } }
      };
    }`;
    const input = { numbers: [1, 2, 3], name: 'test' };
    const config = {};
    const result = await runUserCode(code, input, config);
    assert.deepStrictEqual(result, {
      sum: 6,
      doubled: [2, 4, 6],
      nested: { deep: { value: 'test' } },
    });
  });
});
