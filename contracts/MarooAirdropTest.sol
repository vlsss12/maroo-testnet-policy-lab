// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Maroo Test Activity
/// @notice Minimal educational contract for recording testnet calls.
/// @dev Not audited and not intended to hold funds or be used in production.
contract MarooAirdropTest {
    string public constant name = "Maroo Test Activity";
    uint256 public count;

    event Activity(address indexed user, uint256 indexed value);

    function recordActivity(uint256 value) external {
        count += value;
        emit Activity(msg.sender, value);
    }
}
