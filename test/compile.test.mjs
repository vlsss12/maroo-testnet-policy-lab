import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import solc from 'solc';

test('MarooAirdropTest compiles with its documented public interface', async () => {
  const source = await fs.readFile(new URL('../contracts/MarooAirdropTest.sol', import.meta.url), 'utf8');
  const input = {
    language: 'Solidity',
    sources: { 'MarooAirdropTest.sol': { content: source } },
    settings: { optimizer: { enabled: true, runs: 200 }, outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } } },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const errors = output.errors?.filter((entry) => entry.severity === 'error') ?? [];
  assert.deepEqual(errors, [], errors.map((entry) => entry.formattedMessage).join('\n'));

  const artifact = output.contracts['MarooAirdropTest.sol'].MarooAirdropTest;
  const signatures = new Set(artifact.abi.map((entry) => `${entry.type}:${entry.name ?? ''}`));
  assert.ok(signatures.has('function:recordActivity'));
  assert.ok(signatures.has('function:count'));
  assert.ok(signatures.has('function:activityCount'));
  assert.ok(signatures.has('event:Activity'));
  assert.ok(artifact.evm.bytecode.object.length > 0);
});
