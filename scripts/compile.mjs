import fs from 'node:fs/promises';
import path from 'node:path';
import solc from 'solc';

const root = process.cwd();
const sourcePath = path.join(root, 'contracts', 'MarooAirdropTest.sol');
const source = await fs.readFile(sourcePath, 'utf8');
const input = {
  language: 'Solidity',
  sources: { 'MarooAirdropTest.sol': { content: source } },
  settings: {
    optimizer: { enabled: true, runs: 200 },
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode.object'] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
if (output.errors?.some((entry) => entry.severity === 'error')) {
  console.error(output.errors.map((entry) => entry.formattedMessage).join('\n'));
  process.exit(1);
}

const contract = output.contracts['MarooAirdropTest.sol'].MarooAirdropTest;
const artifact = {
  contractName: 'MarooAirdropTest',
  sourceName: 'MarooAirdropTest.sol',
  abi: contract.abi,
  bytecode: `0x${contract.evm.bytecode.object}`,
};
const artifactDir = path.join(root, 'artifacts');
await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(path.join(artifactDir, 'MarooAirdropTest.json'), `${JSON.stringify(artifact, null, 2)}\n`);
console.log('Compiled MarooAirdropTest → artifacts/MarooAirdropTest.json');
