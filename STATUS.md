# Project Status

Last reviewed: 2026-10-06

## Verified testnet activity

- In the original experiment, an earlier minimal revision of `MarooAirdropTest` was deployed on Maroo Testnet and `recordActivity(1)` was called once.
- On 2026-10-06, the current repository source was compiled, deployed to Maroo Testnet (chain ID `450815`), and `recordActivity(1)` was called once. The terminal receipt reported success, one emitted log, and a counter value of `1`.
- The earlier deployment used a different source revision; do not treat its bytecode as matching the current teaching contract.
- Wallet address, contract address, and transaction hashes are intentionally omitted from this repository. The underlying on-chain records remain public and cannot be made private by omitting identifiers here.

## PCL status

- A previous PCL proxy deployment attempt reverted.
- No successful registered PCL proxy or denylist configuration has been confirmed.
- The PCL proxy deployment and policy-configuration scripts have not yet been executed end-to-end against the live testnet.
- Live read-only RPC inspection on 2026-10-06 confirmed chain ID `450815` and `DENYLIST_POLICY` metadata (`Denylist`, `Denylist policy`). The zero address is not registered as a proxy.
- The live `policyTemplate` response contained three strings, while current docs describe a fourth `paramSchema` field. The inspector handles both shapes; the policy setup script avoids assuming a return layout.
- Local tests check compilation/ABI and mocked inspector responses. They do not prove on-chain PCL enforcement. The browser payment guardrail remains a prototype, not PCL enforcement.

## Rewards

No official Maroo points or airdrop eligibility rules were identified during this review. Testnet activity and this independent educational project do not imply reward eligibility or guarantee a future reward. Check official Maroo announcements.

## Safety

Transactions and wallet activity are publicly queryable on the testnet. Do not publish wallet or transaction identifiers unless you accept that linkage. The contract is educational, unaudited, and not intended to hold funds.
