import 'dotenv/config';
import { AbiCoder, Contract, JsonRpcProvider, Wallet } from 'ethers';

const RPC_URL = process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io';
const CHAIN_ID = 450815n;
const PCL = '0x1000000000000000000000000000000000000005';
const implementation = process.env.IMPLEMENTATION_ADDRESS;
const privateKey = process.env.DEPLOYER_KEY;

if (!privateKey) throw new Error('Set DEPLOYER_KEY locally; never paste it into a shared issue or commit.');
if (!implementation || !/^0x[0-9a-fA-F]{40}$/.test(implementation)) {
  throw new Error('Set IMPLEMENTATION_ADDRESS to a deployed implementation contract.');
}

const pclAbi = [
  'function deployPclProxy(uint8 kind, uint256 value, bytes initData) payable returns (address proxy)',
  'function pclProxy(address proxy) view returns ((uint8 kind, address admin, address proxy))',
];
const provider = new JsonRpcProvider(RPC_URL);
const network = await provider.getNetwork();
if (network.chainId !== CHAIN_ID) throw new Error(`Refusing to sign: expected chain ID ${CHAIN_ID}, got ${network.chainId}.`);

const wallet = new Wallet(privateKey, provider);
const implementationCode = await provider.getCode(implementation);
if (implementationCode === '0x') throw new Error('IMPLEMENTATION_ADDRESS has no deployed bytecode on this network.');

// Official Maroo Transparent-proxy constructor tuple: (logic, initialOwner, initializer).
// This demo implementation has no initializer; the PCL policy admin is msg.sender (wallet).
const initData = AbiCoder.defaultAbiCoder().encode(
  ['address', 'address', 'bytes'],
  [implementation, wallet.address, '0x'],
);
const pcl = new Contract(PCL, pclAbi, wallet);

// Simulate first, then send. Verify the registry entry after confirmation before proceeding.
const predictedProxy = await pcl.deployPclProxy.staticCall(1, 0n, initData, { value: 0n });
const tx = await pcl.deployPclProxy(1, 0n, initData, { value: 0n });
const receipt = await tx.wait();
if (!receipt || receipt.status !== 1) throw new Error('PCL proxy deployment was not confirmed successfully.');

const entry = await pcl.pclProxy(predictedProxy);
if (Number(entry.kind) !== 1 || entry.admin.toLowerCase() !== wallet.address.toLowerCase() || entry.proxy.toLowerCase() !== predictedProxy.toLowerCase()) {
  throw new Error('Transaction succeeded, but the PCL registry entry did not match expected kind/admin/proxy. Stop and inspect Explorer.');
}

console.log('PCL Transparent proxy deployed and registry entry verified.');
console.log(`Proxy: ${predictedProxy}`);
console.log(`Transaction: ${receipt.hash}`);
console.log('This public transaction links the sender wallet to the proxy. Share these identifiers only if you accept that linkage.');
