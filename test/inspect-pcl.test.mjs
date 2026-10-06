import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Interface } from 'ethers';
import { inspectPcl, MAROO_CHAIN_ID, PCL_ABI, PCL_ADDRESS } from '../scripts/inspect-pcl.mjs';

const iface = new Interface(PCL_ABI);

function mockProvider({ chainId = MAROO_CHAIN_ID, templateId = 'DENYLIST_POLICY', proxyAddress = '0x00000000000000000000000000000000000000aa', registered = true } = {}) {
  return {
    async getNetwork() { return { chainId }; },
    async call({ to, data }) {
      assert.equal(to.toLowerCase(), PCL_ADDRESS.toLowerCase());
      const call = iface.parseTransaction({ data });
      if (call.name === 'policyTemplate') {
        assert.equal(call.args[0], templateId);
        return iface.encodeFunctionResult('policyTemplate', [[templateId, 'Denylist', 'Blocks listed principals', '0x123456']]);
      }
      if (call.name === 'pclProxy') {
        return iface.encodeFunctionResult('pclProxy', [[1, '0x00000000000000000000000000000000000000bb', registered ? proxyAddress : '0x0000000000000000000000000000000000000000']]);
      }
      throw new Error(`Unexpected RPC call: ${call.name}`);
    },
  };
}

test('inspects template metadata and a registered Transparent proxy without signing', async () => {
  const result = await inspectPcl({ provider: mockProvider(), templateId: 'DENYLIST_POLICY', proxyAddress: '0x00000000000000000000000000000000000000aa' });
  assert.equal(result.chainId, '450815');
  assert.equal(result.template.id, 'DENYLIST_POLICY');
  assert.equal(result.template.schemaBytes, 3);
  assert.equal(result.proxy.registered, true);
  assert.equal(result.proxy.kindName, 'Transparent');
});

test('rejects a wrong chain and identifies an unregistered proxy', async () => {
  await assert.rejects(inspectPcl({ provider: mockProvider({ chainId: 1n }), templateId: 'DENYLIST_POLICY' }), /Wrong network/);
  const result = await inspectPcl({ provider: mockProvider({ registered: false }), templateId: 'DENYLIST_POLICY', proxyAddress: '0x00000000000000000000000000000000000000aa' });
  assert.equal(result.proxy.registered, false);
});
