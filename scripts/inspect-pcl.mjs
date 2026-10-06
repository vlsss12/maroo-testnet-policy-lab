import 'dotenv/config';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import process from 'node:process';
import { Interface, JsonRpcProvider, isAddress } from 'ethers';

export const MAROO_CHAIN_ID = 450815n;
export const PCL_ADDRESS = '0x1000000000000000000000000000000000000005';
export const PCL_ABI = [
  'function pclProxy(address proxy) view returns ((uint8 kind, address admin, address proxy))',
];

const pclInterface = new Interface(PCL_ABI);
const templateInterfaces = [
  new Interface(['function policyTemplate(string templateId) view returns ((string templateId, string name, string description, bytes paramSchema))']),
  new Interface(['function policyTemplate(string templateId) view returns ((string templateId, string name, string description))']),
];

export function decodeTemplateResult(data) {
  for (const iface of templateInterfaces) {
    try {
      const [entry] = iface.decodeFunctionResult('policyTemplate', data);
      const templateId = entry[0];
      const name = entry[1];
      const description = entry[2];
      const paramSchema = entry.length > 3 ? entry[3] : undefined;
      if (typeof templateId === 'string' && typeof name === 'string' && typeof description === 'string') {
        return { templateId, name, description, paramSchema };
      }
    } catch {
      // Deployed testnet versions may predate the documented paramSchema field.
    }
  }
  throw new Error('The PCL template response did not match a supported documented ABI shape.');
}

/** Read PCL template metadata and, optionally, check a proxy registration. Never signs or sends a transaction. */
export async function inspectPcl({ provider, templateId, proxyAddress }) {
  if (!templateId?.trim()) throw new Error('Provide a policy template ID, e.g. DENYLIST_POLICY.');
  if (proxyAddress && !isAddress(proxyAddress)) throw new Error('Proxy address must be a valid EVM address.');

  const network = await provider.getNetwork();
  if (network.chainId !== MAROO_CHAIN_ID) {
    throw new Error(`Wrong network: expected Maroo Testnet (${MAROO_CHAIN_ID}), received ${network.chainId}.`);
  }

  const templateCall = templateInterfaces[0].encodeFunctionData('policyTemplate', [templateId.trim()]);
  const templateResult = await provider.call({ to: PCL_ADDRESS, data: templateCall });
  const template = decodeTemplateResult(templateResult);

  const result = {
    chainId: network.chainId.toString(),
    template: {
      id: template.templateId,
      name: template.name,
      description: template.description,
      schemaBytes: template.paramSchema === undefined ? null : (template.paramSchema.length - 2) / 2,
    },
  };

  if (proxyAddress) {
    const proxyCall = pclInterface.encodeFunctionData('pclProxy', [proxyAddress]);
    const proxyResult = await provider.call({ to: PCL_ADDRESS, data: proxyCall });
    const [entry] = pclInterface.decodeFunctionResult('pclProxy', proxyResult);
    result.proxy = {
      address: proxyAddress,
      registered: [1, 2, 3].includes(Number(entry.kind)) && entry.proxy.toLowerCase() === proxyAddress.toLowerCase(),
      kind: Number(entry.kind),
      kindName: ({ 1: 'Transparent', 2: 'UUPS', 3: 'Beacon' })[Number(entry.kind)] ?? 'Unknown',
    };
  }

  return result;
}

async function main() {
  const [templateId, proxyAddress] = process.argv.slice(2);
  if (!templateId) {
    console.error('Usage: npm run inspect:pcl -- <TEMPLATE_ID> [PROXY_ADDRESS]');
    process.exitCode = 2;
    return;
  }

  const provider = new JsonRpcProvider(process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io');
  try {
    const result = await inspectPcl({ provider, templateId, proxyAddress });
    console.log(JSON.stringify(result, null, 2));
    console.log('Read-only inspection complete; no wallet was connected and no transaction was sent.');
  } finally {
    await provider.destroy();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`PCL inspection failed: ${error.shortMessage || error.message}`);
    process.exitCode = 1;
  });
}
