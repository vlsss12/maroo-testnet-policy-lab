import 'dotenv/config';
import { AbiCoder, Contract, JsonRpcProvider, Wallet } from 'ethers';

const RPC_URL = process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io';
const CHAIN_ID = 450815n;
const PCL = '0x1000000000000000000000000000000000000005';
const proxyAddress = process.env.CONTRACT_ADDRESS;
const deniedAddress = process.env.DENIED_TEST_ADDRESS;
const privateKey = process.env.DEPLOYER_KEY;

if (!privateKey) throw new Error('Set DEPLOYER_KEY locally; never paste it into a shared issue or commit.');
if (!proxyAddress || !/^0x[0-9a-fA-F]{40}$/.test(proxyAddress)) throw new Error('Set CONTRACT_ADDRESS to your registered PCL proxy.');
if (!deniedAddress || !/^0x[0-9a-fA-F]{40}$/.test(deniedAddress)) throw new Error('Set DENIED_TEST_ADDRESS to a disposable test address.');

const abi = [
  'function pclProxy(address proxy) view returns ((uint8 kind, address admin, address proxy))',
  // Ignore the return shape: the currently live testnet ABI is older than the docs schema.
  'function policyTemplate(string templateId) view',
  'function changeContractPolicies((address _contract, address admin, (string templateId, bytes policy, bytes selector)[] policies) config)',
];
const provider = new JsonRpcProvider(RPC_URL);
const network = await provider.getNetwork();
if (network.chainId !== CHAIN_ID) throw new Error(`Refusing to sign: expected chain ID ${CHAIN_ID}, got ${network.chainId}.`);

const wallet = new Wallet(privateKey, provider);
const pcl = new Contract(PCL, abi, wallet);
const entry = await pcl.pclProxy(proxyAddress);
if (entry.proxy.toLowerCase() !== proxyAddress.toLowerCase()) throw new Error('Address is not present in the Maroo PCL proxy registry.');
if (entry.admin.toLowerCase() !== wallet.address.toLowerCase()) throw new Error('Connected signer is not the current PCL admin.');
await pcl.policyTemplate('DENYLIST_POLICY');

// DENYLIST_POLICY expects ABI-encoded address[]; empty selector applies at contract scope.
const policyBytes = AbiCoder.defaultAbiCoder().encode(['address[]'], [[deniedAddress]]);
const config = {
  _contract: proxyAddress,
  admin: wallet.address,
  policies: [{ templateId: 'DENYLIST_POLICY', policy: policyBytes, selector: '0x' }],
};
await pcl.changeContractPolicies.staticCall(config);
const tx = await pcl.changeContractPolicies(config);
const receipt = await tx.wait();
if (!receipt || receipt.status !== 1) throw new Error('Policy update was not confirmed successfully.');

console.log('DENYLIST_POLICY transaction confirmed.');
console.log('Verified DENYLIST_POLICY is registered on the connected network.');
console.log(`Proxy: ${proxyAddress}`);
console.log(`Denied test address: ${deniedAddress}`);
console.log(`Transaction: ${receipt.hash}`);
console.log('Next, verify the stored policy and test both allowed and denied calls before claiming end-to-end PCL validation.');
