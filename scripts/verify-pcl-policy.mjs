import 'dotenv/config';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';

const RPC_URL = process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io';
const CHAIN_ID = 450815n;
const PCL = '0x1000000000000000000000000000000000000005';
const proxyAddress = process.env.CONTRACT_ADDRESS;
const allowedKey = process.env.DEPLOYER_KEY;
const deniedKey = process.env.DENIED_TEST_KEY;
const deniedAddress = process.env.DENIED_TEST_ADDRESS;

for (const [key, value] of Object.entries({ CONTRACT_ADDRESS: proxyAddress, DEPLOYER_KEY: allowedKey, DENIED_TEST_KEY: deniedKey, DENIED_TEST_ADDRESS: deniedAddress })) {
  if (!value) throw new Error(`Set ${key} in your local .env file.`);
}
if (!/^0x[0-9a-fA-F]{40}$/.test(proxyAddress)) throw new Error('CONTRACT_ADDRESS must be a 20-byte proxy address.');
if (!/^0x[0-9a-fA-F]{40}$/.test(deniedAddress)) throw new Error('DENIED_TEST_ADDRESS must be a 20-byte address.');

const provider = new JsonRpcProvider(RPC_URL);
const network = await provider.getNetwork();
if (network.chainId !== CHAIN_ID) throw new Error(`Expected Maroo Testnet chain ID ${CHAIN_ID}, got ${network.chainId}.`);

const deniedWallet = new Wallet(deniedKey, provider);
if (deniedWallet.address.toLowerCase() !== deniedAddress.toLowerCase()) {
  throw new Error('DENIED_TEST_KEY does not match DENIED_TEST_ADDRESS.');
}

const pcl = new Contract(PCL, [
  'function pclProxy(address proxy) view returns ((uint8 kind, address admin, address proxy))',
], provider);
const entry = await pcl.pclProxy(proxyAddress);
if (entry.proxy.toLowerCase() !== proxyAddress.toLowerCase()) throw new Error('Target is not registered as a Maroo PCL proxy.');

const activity = new Contract(proxyAddress, ['function recordActivity(uint256 value)'], provider);
await activity.connect(new Wallet(allowedKey, provider)).recordActivity.staticCall(1n);
console.log('PASS: allowed test signer passes the PCL eth_call preflight.');

let denied = false;
try {
  await activity.connect(deniedWallet).recordActivity.staticCall(1n);
} catch {
  denied = true;
}
if (!denied) throw new Error('Expected the denylisted signer to be rejected, but its eth_call succeeded.');
console.log('PASS: denylisted test signer is rejected by the PCL eth_call preflight.');
console.log('Read-only eth_call checks completed; no transaction was submitted.');
