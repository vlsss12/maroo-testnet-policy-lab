# Maroo Testnet Policy Lab — Step-by-Step Builder Guide

This guide reproduces a minimal Maroo Testnet smart-contract experiment and then explains how to continue toward a PCL-regulated interaction. It is written for developers and community members who want a verifiable learning project—not a shortcut to rewards.

## 1. Understand what you are building

The demo contract stores a counter and emits an `Activity` event when `recordActivity(value)` is called. It is intentionally tiny so that deployment and event verification are easy to inspect.

There are two different stages:

1. **Verified in the original experiment:** direct deployment of the simple activity contract and a successful call to its activity method on Maroo Testnet.
2. **Not yet verified:** wrapping an implementation with a Maroo PCL proxy, configuring a policy, and successfully calling through that registered proxy. The first proxy deployment attempt reverted, so this guide does not claim that step succeeded.

## 2. Configure the test network

Add this network to a test wallet using Maroo's official instructions:

| Field | Value |
| --- | --- |
| Network | Maroo Testnet |
| Chain ID | `450815` |
| RPC URL | `https://rpc-testnet.maroo.io` |
| Currency | `tOKRW` |
| Explorer | `https://explorer-testnet.maroo.io` |

Get test tokens from the [official faucet](https://faucet.maroo.io/). Faucet tokens are test-only and have no monetary value. Do not fund the wallet with real assets for this tutorial.

Official reference: [Maroo Testnet access](https://docs.maroo.io/resources/network/testnet-access).

## 3. Get the source and install dependencies

```bash
git clone https://github.com/vlsss12/maroo-testnet-policy-lab.git
cd maroo-testnet-policy-lab
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Edit `.env` on your machine. Put a **test-only** deployer private key in `DEPLOYER_KEY`; never share or commit `.env`. Ideally use a fresh test wallet that holds no mainnet assets. Do not put a seed phrase into any script or website.

## 4. Compile the Solidity contract

```bash
npm run compile
```

The script reads `contracts/MarooAirdropTest.sol` and writes a local artifact under `artifacts/`. Generated artifacts are ignored by Git. The contract source is educational and is not audited.

## 5. Deploy the activity contract

```bash
npm run deploy
```

The script checks that the RPC reports chain ID `450815` before signing. On success it prints the deployed contract address and deployment transaction hash **to your terminal only**. Keep those values private if you do not want the wallet that deployed it to be discoverable from the public chain.

Open the contract address in the [Maroo Testnet Explorer](https://explorer-testnet.maroo.io/) and check that the contract exists. Explorer records are public and immutable on the testnet.

## 6. Record one activity

Set `CONTRACT_ADDRESS` in your local `.env` to the new deployment address, then run:

```bash
npm run record
```

The script checks the network, submits `recordActivity(1)`, waits for the receipt, and prints the transaction hash locally. Verify that the receipt succeeded and that an `Activity` event was emitted. Do not publish the address or transaction hash if you intend to keep the associated wallet unlinkable.

## 7. Understand the PCL regulated path before attempting it

Maroo's docs distinguish direct EVM calls from calls routed through a PCL-registered proxy. A direct call is the open path; contract-specific policy enforcement requires the registered proxy route. A UI-side check or `eth_call` by itself is not proof that an on-chain policy is installed.

Read these official references before continuing:

1. [PCL dual-track transaction model](https://docs.maroo.io/concepts/compliance/pcl-dual-track-model)
2. [`IPcl.deployPclProxy`](https://docs.maroo.io/apis/contract/contract-pcl-deploy-pcl-proxy)
3. [`IPcl.changeContractPolicies`](https://docs.maroo.io/apis/contract/pcl-update-contract-policy)
4. The specific policy template documentation, such as [`DENYLIST_POLICY`](https://docs.maroo.io/concepts/compliance/denylist-policy)

The documented Transparent proxy flow is broadly:

1. Deploy an implementation contract first.
2. Encode Transparent proxy initialization data as `abi.encode(logicAddress, initialOwner, initializerCalldata)`. If no initializer is needed, the docs specify `0x` for the initializer calldata.
3. Call the PCL precompile's `deployPclProxy(Transparent, 0, initData)` on Maroo Testnet. The docs state the immediate caller becomes the initial policy admin; verify this against the currently published API before signing.
4. Read `pclProxy(proxyAddress)` and confirm the returned `kind`, `admin`, and `proxy` match what you expect. Stop if the call reverts or the registry entry is missing.
5. Use `changeContractPolicies` with the registered proxy address, the current admin, and the exact policy payload/selector required by the selected template. Policy configuration can be replaced by the current admin, so protect that key.
6. Use `eth_call` to preflight the exact user call through the proxy. Then test both an allowed and a deliberately denied case using disposable test accounts.
7. Only after both preflight cases make sense, consider sending the test transaction. Inspect the wallet prompt and verify the transaction on Explorer.

**Do not copy an unverified ABI from a blog or this project's historical UI.** Use the current official ABI/docs and check `policyTemplate(templateId)` first. The first implementation attempt associated with this project reverted; no PCL proxy or policy is claimed as deployed here.

## 8. What to publish as proof of work

Good public artifacts include:

- source code and clear instructions to reproduce the build;
- a short explanation of what succeeded, what failed, and how it was verified;
- contract addresses or transaction links **only if you are comfortable making the related wallet discoverable**;
- screenshots with addresses, account names, and transaction identifiers removed when privacy matters.

Do not claim an airdrop, points, whitelist status, or official endorsement unless Maroo publishes explicit rules. Do not spam transactions or create multiple wallets to imitate activity; that can waste fees and may violate project rules.

## 9. Troubleshooting checklist

If deployment or a PCL action reverts:

- confirm MetaMask is on chain `450815` and uses the official RPC;
- check the PCL proxy kind is supported (`Transparent` is documented as `1`);
- check the encoded `initData` tuple shape matches the selected proxy kind;
- check the implementation address contains code and the initializer calldata is correct;
- read `pclProxy(proxy)` after deployment and stop if it is unregistered;
- query the requested policy template and confirm its exact ID, byte encoding, and selector rules;
- inspect the wallet's estimated gas/revert reason and the failed receipt, if one exists;
- compare every ABI tuple name/order to the current official reference.

Avoid repeatedly resubmitting the same reverting transaction. Diagnose the first failure before trying again.

## 10. Airdrop and reward disclaimer

This is an independent community guide. At publication time, no official Maroo points/airdrop eligibility rules were identified. Testnet tOKRW has no monetary value. Builder activity may be useful for learning and may be visible on-chain, but it does not guarantee a future reward.

## Sources

- [Maroo Testnet access](https://docs.maroo.io/resources/network/testnet-access)
- [PCL dual-track model](https://docs.maroo.io/concepts/compliance/pcl-dual-track-model)
- [`deployPclProxy` API](https://docs.maroo.io/apis/contract/contract-pcl-deploy-pcl-proxy)
- [`changeContractPolicies` API](https://docs.maroo.io/apis/contract/pcl-update-contract-policy)
- [Maroo Experience service information](https://experience.maroo.io/en/service-info)
- [Maroo Experience Terms](https://experience.maroo.io/en/terms)
