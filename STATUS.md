# Project Status

Last reviewed: 2026-10-06

## Verified in the original testnet experiment

- Connected a test wallet to Maroo Testnet (chain ID `450815`).
- Deployed a minimal `MarooAirdropTest` contract.
- Called `recordActivity(1)` successfully once; the contract counter read `1` afterward.
- Built a local browser prototype for wallet connection, a mock payment preflight, and PCL exploration.
- The historical testnet deployment used an earlier, simpler source revision than the current teaching contract; the current source must be deployed and verified separately if bytecode/source correspondence is needed.

Account identifiers, deployment address, and transaction hashes are deliberately omitted. The chain itself is public; omitting them here does **not** erase or anonymize existing on-chain records.

## Not verified / not completed

- The PCL proxy deployment attempt reverted.
- No registered PCL proxy was confirmed for this experiment.
- No denylist policy was installed for this experiment.
- No regulated-path activity call was confirmed for this experiment.
- The browser-only payment guardrail is a prototype check; it is not PCL enforcement.
- The new PCL deployment and denylist scripts have not been executed against Maroo Testnet.
- Automated `npm test` verifies Solidity compilation and ABI shape only; it is not an EVM behavioral suite.

## Reward status

No official points or airdrop rule was identified while preparing this repository. Nothing here implies eligibility or a promise of future rewards. Check Maroo's official website and documentation for current announcements.

## Current local checks

- `npm test`: passed (Solidity compilation + ABI regression check).
- `npm run compile`: passed.
- Testnet PCL deployment/policy execution: not run; signing would publicly expose the sending wallet's activity.
