# Project Status

Last reviewed: 2026-10-06

## Historical testnet experiment

- Connected a test wallet to Maroo Testnet (chain ID `450815`).
- Deployed a minimal `MarooAirdropTest` contract and called `recordActivity(1)` once; the counter read `1` afterward.
- The historical deployment used an earlier source revision than the current teaching contract.
- Account identifiers, deployment address, and transaction hashes are omitted here. On-chain records remain public.

## Current validation

- `npm test` and `npm run compile` passed locally.
- Live read-only RPC check on 2026-10-06 confirmed chain ID `450815` and `DENYLIST_POLICY` metadata (`Denylist`, `Denylist policy`). The zero address is not registered as a PCL proxy.
- Live `policyTemplate` returned three strings, while current docs describe a fourth `paramSchema` field. Inspector supports both shapes; configuration script no longer decodes the shape.
- No PCL proxy or denylist configuration transaction has been confirmed. The prior PCL proxy deployment attempt reverted.
- Automated tests are mocked/local and do not prove on-chain PCL enforcement. The browser payment guardrail is also only a prototype, not PCL enforcement.

## Rewards

No official points or airdrop rule was identified during review. Nothing here implies eligibility or a promise of future rewards; check official Maroo announcements.

No transaction was sent during the read-only verification.
