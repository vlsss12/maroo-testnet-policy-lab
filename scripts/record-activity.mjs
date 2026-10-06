import 'dotenv/config';
import fs from 'node:fs/promises';
import { Contract, JsonRpcProvider, Wallet } from 'ethers';

const rpcUrl = process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io';
const privateKey = process.env.DEPLOYER_KEY;
const address = process.env.CONTRACT_ADDRESS;
if (!privateKey) throw new Error('Set DEPLOYER_KEY in your local .env file.');
if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
  throw new Error('Set CONTRACT_ADDRESS to your own testnet deployment in .env.');
}

const provider = new JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (network.chainId !== 450815n) {
  throw new Error(`Refusing to transact: expected chain ID 450815, got ${network.chainId}.`);
}

const wallet = new Wallet(privateKey, provider);
const artifact = JSON.parse(await fs.readFile('artifacts/MarooAirdropTest.json', 'utf8'));
const contract = new Contract(address, artifact.abi, wallet);
const tx = await contract.recordActivity(1n);
console.log(`Submitted: ${tx.hash}`);
const receipt = await tx.wait();
if (receipt.status !== 1) throw new Error('Transaction receipt indicates failure.');
console.log(`Confirmed in block ${receipt.blockNumber}; emitted ${receipt.logs.length} log(s).`);
console.log(`Current counter: ${await contract.count()}`);
console.log('Keep this output private if you do not want the caller wallet to be discoverable.');
