// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IMevaVault
/// @notice Interface for the MEVA dividend distribution vault
interface IMevaVault {
    /// @notice Emitted when MEV tax is received
    event TaxReceived(address indexed bot, address indexed token, uint256 amount);

    /// @notice Emitted when dividends are claimed
    event DividendClaimed(address indexed user, uint256 amount, ClaimType claimType);

    /// @notice Emitted when a new epoch starts
    event EpochAdvanced(uint256 indexed epoch, uint256 totalCollected);

    /// @notice Emitted when victim rebate is added
    event VictimRebateAdded(address indexed victim, uint256 amount);

    /// @notice Types of claims
    enum ClaimType {
        LP,
        Victim,
        Staker
    }

    /// @notice Receive MEV tax from the hook
    /// @param bot The bot that was taxed
    /// @param token The token address (address(0) for ETH)
    /// @param amount The tax amount
    function receiveTax(address bot, address token, uint256 amount) external payable;

    /// @notice Add rebate for a sandwich victim
    /// @param victim The victim's address
    /// @param amount The rebate amount
    function addVictimRebate(address victim, uint256 amount) external;

    /// @notice Claim LP dividend
    /// @return amount The claimed amount
    function claimLPDividend() external returns (uint256 amount);

    /// @notice Claim victim rebate
    /// @return amount The claimed amount
    function claimRebate() external returns (uint256 amount);

    /// @notice Claim staker reward
    /// @return amount The claimed amount
    function claimStakerReward() external returns (uint256 amount);

    /// @notice Calculate pending LP dividend for an address
    /// @param lp The LP address
    /// @return The pending dividend amount
    function pendingLPDividend(address lp) external view returns (uint256);

    /// @notice Get the victim rebate for an address
    /// @param victim The victim address
    /// @return The pending rebate amount
    function pendingRebate(address victim) external view returns (uint256);

    /// @notice Get protocol statistics
    /// @return totalCollected Total MEV tax collected
    /// @return totalDistributed Total dividends distributed
    /// @return currentEpoch Current epoch number
    function getStats() external view returns (uint256 totalCollected, uint256 totalDistributed, uint256 currentEpoch);
}
