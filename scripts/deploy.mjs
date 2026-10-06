import 'dotenv/config';
import fs from 'node:fs/promises';
import { ContractFactory, JsonRpcProvider, Wallet } from 'ethers';

const rpcUrl = process.env.MAROO_RPC_URL || 'https://rpc-testnet.maroo.io';
const privateKey = process.env.DEPLOYER_KEY;
if (!privateKey) throw new Error('Set DEPLOYER_KEY in your local .env file.');

const provider = new JsonRpcProvider(rpcUrl);
const network = await provider.getNetwork();
if (network.chainId !== 450815n) {
  throw new Error(`Refusing to deploy: expected chain ID 450815, got ${network.chainId}.`);
}

const wallet = new Wallet(privateKey, provider);
const artifact = JSON.parse(await fs.readFile('artifacts/MarooAirdropTest.json', 'utf8'));
const factory = new ContractFactory(artifact.abi, artifact.bytecode, wallet);
const contract = await factory.deploy();
await contract.waitForDeployment();

console.log('Deployment confirmed on Maroo Testnet.');
console.log(`Contract: ${await contract.getAddress()}`);
console.log(`Transaction: ${contract.deploymentTransaction()?.hash}`);
console.log('Keep this output private if you do not want the deployer wallet to be discoverable.');
