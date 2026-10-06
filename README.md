# Maroo Testnet Policy Lab

A small, reproducible builder project for learning Maroo Testnet: deploy a Solidity activity contract, record an on-chain action, and then explore how Maroo's Programmable Compliance Layer (PCL) regulated path differs from a direct EVM call.

> **Status:** The simple activity contract was deployed and called on Maroo Testnet during the original experiment. A PCL proxy deployment was also attempted, but reverted. This repository does not claim that the PCL flow was successfully deployed or verified end to end.

This is an independent educational project, not an official Maroo repository. It does not promise points, an airdrop, token allocation, or any reward. Testnet tokens have no monetary value.

## What is included

- `contracts/MarooAirdropTest.sol` — minimal event-emitting activity contract.
- `scripts/compile.mjs` — compile the contract locally with `solc`.
- `scripts/deploy.mjs` — deploy to Maroo Testnet using a local environment variable.
- `scripts/record-activity.mjs` — call the contract and wait for confirmation.
- `scripts/deploy-pcl-proxy.mjs` — deploy and verify a Transparent PCL proxy using the documented initializer tuple.
- `scripts/configure-denylist.mjs` — attach a contract-scope `DENYLIST_POLICY` to a registered proxy.
- `test/` — local Solidity compile and ABI regression check.
- `GUIDE.md` — step-by-step setup, deployment, verification, and PCL learning path.
- `STATUS.md` — an honest record of what was and was not verified.

## Quick start

Requirements: Node.js 20 or newer, npm, a wallet configured for Maroo Testnet, and testnet tOKRW for gas.

```bash
npm install
cp .env.example .env
# Edit .env locally. Never commit the private key.
npm run compile
npm test
npm run deploy
```

Copy the newly deployed contract address into `CONTRACT_ADDRESS` in your local `.env`, then:

```bash
npm run record
```

For the full walkthrough and PCL caveats, read [GUIDE.md](GUIDE.md).

## Maroo Testnet

| Setting | Value |
| --- | --- |
| Chain ID | `450815` |
| RPC | `https://rpc-testnet.maroo.io` |
| Native test asset | `tOKRW` |
| Explorer | [explorer-testnet.maroo.io](https://explorer-testnet.maroo.io/) |
| Faucet | [faucet.maroo.io](https://faucet.maroo.io/) |

Always check the chain ID before signing. Do not use a mainnet wallet key or real funds for this tutorial.

## PCL learning path

Maroo documents two tracks: direct calls use the open path; calls made to a PCL-registered proxy use the regulated path and can enforce proxy-bound policies. The PCL path in this project is documented as a **follow-up exercise**, not as a completed deployment. Follow Maroo's current docs and verify the returned proxy registry entry before sending any call.

For the proxy exercise, set `IMPLEMENTATION_ADDRESS` in `.env` and run `npm run deploy:pcl`. For the optional denylist, set `CONTRACT_ADDRESS` to the verified proxy and `DENIED_TEST_ADDRESS` to a disposable test identity, then run `npm run configure:denylist`. These scripts have not yet been executed end-to-end on Maroo Testnet. Any signed transaction publicly links the signer wallet to that activity; only proceed if you accept that exposure.

- [PCL dual-track model](https://docs.maroo.io/concepts/compliance/pcl-dual-track-model)
- [`deployPclProxy` API](https://docs.maroo.io/apis/contract/contract-pcl-deploy-pcl-proxy)
- [`changeContractPolicies` API](https://docs.maroo.io/apis/contract/pcl-update-contract-policy)
- [Maroo testnet setup](https://docs.maroo.io/resources/network/testnet-access)

## Privacy and safety

- No wallet address, personal name, or personal email is embedded in this repository.
- `.env` is ignored by Git. Never paste a private key, seed phrase, or wallet export into an issue, commit, screenshot, or shared guide.
- The original experiment's contract address and transaction hashes are intentionally omitted: public explorer links can reveal the originating wallet.
- This contract is a tutorial artifact, not production software. It has no access control and should not hold funds.
- Review every wallet prompt. Stop if the network, destination, calldata, or value is unexpected.

## Airdrop note

At the time this guide was prepared, we found no official Maroo airdrop or points rules to rely on. Testnet activity is useful for learning and demonstrating builder work, but it is not evidence of reward eligibility. Verify any future campaign only through Maroo's official channels.

## License

MIT. See [LICENSE](LICENSE).
