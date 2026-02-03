// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IMevaVault} from "./interfaces/IMevaVault.sol";

/// @title MevaVault
/// @notice MEV Dividend Distribution Vault
/// @dev Collects MEV taxes and distributes them to LPs, victims, and stakers
contract MevaVault is IMevaVault, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ Constants ============

    /// @notice Distribution shares (in basis points, 10000 = 100%)
    uint256 public constant LP_SHARE = 5000; // 50%
    uint256 public constant VICTIM_SHARE = 3000; // 30%
    uint256 public constant STAKER_SHARE = 2000; // 20%
    uint256 public constant BASIS_POINTS = 10000;

    // ============ State Variables ============

    /// @notice The primary token for dividends (e.g., WETH or USDC)
    IERC20 public immutable dividendToken;

    /// @notice Current epoch number
    uint256 public currentEpoch = 1;

    /// @notice Total MEV tax collected all time
    uint256 public totalCollected;

    /// @notice Total dividends distributed all time
    uint256 public totalDistributed;

    /// @notice Authorized hook addresses that can send tax
    mapping(address => bool) public authorizedHooks;

    // ============ LP Tracking ============

    /// @notice LP shares for dividend calculation
    mapping(address => uint256) public lpShares;

    /// @notice Total LP shares
    uint256 public totalLPShares;

    /// @notice Accumulated dividends per share (scaled by 1e18)
    uint256 public accDividendPerShare;

    /// @notice LP dividend debt (for proper accounting)
    mapping(address => uint256) public lpDividendDebt;

    /// @notice Pending LP dividends
    mapping(address => uint256) public pendingLPDividends;

    // ============ Victim Rebates ============

    /// @notice Victim rebate balances
    mapping(address => uint256) public victimRebates;

    /// @notice Total pending victim rebates
    uint256 public totalPendingRebates;

    // ============ Staker Tracking ============

    /// @notice Staker shares
    mapping(address => uint256) public stakerShares;

    /// @notice Total staker shares
    uint256 public totalStakerShares;

    /// @notice Accumulated staker rewards per share
    uint256 public accStakerRewardPerShare;

    /// @notice Staker reward debt
    mapping(address => uint256) public stakerRewardDebt;

    /// @notice Pending staker rewards
    mapping(address => uint256) public pendingStakerRewards;

    // ============ Pool Tracking ============

    /// @notice LP pool balance (for distribution)
    uint256 public lpPool;

    /// @notice Staker pool balance
    uint256 public stakerPool;

    // ============ Errors ============

    error Unauthorized();
    error NothingToClaim();
    error ZeroAddress();
    error ZeroAmount();

    // ============ Constructor ============

    constructor(address _dividendToken) Ownable(msg.sender) {
        if (_dividendToken == address(0)) revert ZeroAddress();
        dividendToken = IERC20(_dividendToken);
    }

    // ============ Authorization ============

    modifier onlyAuthorizedHook() {
        if (!authorizedHooks[msg.sender]) revert Unauthorized();
        _;
    }

    /// @notice Authorize a hook to send taxes
    /// @param hook The hook address
    /// @param authorized Whether to authorize or revoke
    function setAuthorizedHook(address hook, bool authorized) external onlyOwner {
        authorizedHooks[hook] = authorized;
    }

    // ============ Tax Collection ============

    /// @inheritdoc IMevaVault
    function receiveTax(address bot, address token, uint256 amount) external payable override onlyAuthorizedHook {
        if (amount == 0 && msg.value == 0) revert ZeroAmount();

        uint256 taxAmount = token == address(0) ? msg.value : amount;

        // If ERC20, transfer it
        if (token != address(0) && amount > 0) {
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        totalCollected += taxAmount;

        // Distribute to pools
        uint256 lpAmount = (taxAmount * LP_SHARE) / BASIS_POINTS;
        uint256 victimAmount = (taxAmount * VICTIM_SHARE) / BASIS_POINTS;
        uint256 stakerAmount = taxAmount - lpAmount - victimAmount;

        lpPool += lpAmount;
        stakerPool += stakerAmount;

        // Update LP accumulated dividends
        if (totalLPShares > 0) {
            accDividendPerShare += (lpAmount * 1e18) / totalLPShares;
        }

        // Update staker accumulated rewards
        if (totalStakerShares > 0) {
            accStakerRewardPerShare += (stakerAmount * 1e18) / totalStakerShares;
        }

        emit TaxReceived(bot, token, taxAmount);
    }

    // ============ Victim Rebates ============

    /// @inheritdoc IMevaVault
    function addVictimRebate(address victim, uint256 amount) external override onlyOwner {
        if (victim == address(0)) revert ZeroAddress();
        if (amount == 0) revert ZeroAmount();

        victimRebates[victim] += amount;
        totalPendingRebates += amount;

        emit VictimRebateAdded(victim, amount);
    }

    /// @notice Batch add victim rebates
    /// @param victims Array of victim addresses
    /// @param amounts Array of rebate amounts
    function addVictimRebatesBatch(address[] calldata victims, uint256[] calldata amounts) external onlyOwner {
        require(victims.length == amounts.length, "Length mismatch");

        for (uint256 i = 0; i < victims.length; i++) {
            if (victims[i] != address(0) && amounts[i] > 0) {
                victimRebates[victims[i]] += amounts[i];
                totalPendingRebates += amounts[i];
                emit VictimRebateAdded(victims[i], amounts[i]);
            }
        }
    }

    // ============ LP Management ============

    /// @notice Register or update LP shares
    /// @param lp The LP address
    /// @param shares The new share amount
    function setLPShares(address lp, uint256 shares) external onlyOwner {
        if (lp == address(0)) revert ZeroAddress();

        // Settle any pending dividends first
        _settleLPDividend(lp);

        // Update shares
        totalLPShares = totalLPShares - lpShares[lp] + shares;
        lpShares[lp] = shares;

        // Update debt
        lpDividendDebt[lp] = (shares * accDividendPerShare) / 1e18;
    }

    /// @notice Batch update LP shares
    /// @param lps Array of LP addresses
    /// @param shares Array of share amounts
    function setLPSharesBatch(address[] calldata lps, uint256[] calldata shares) external onlyOwner {
        require(lps.length == shares.length, "Length mismatch");

        for (uint256 i = 0; i < lps.length; i++) {
            if (lps[i] != address(0)) {
                _settleLPDividend(lps[i]);
                totalLPShares = totalLPShares - lpShares[lps[i]] + shares[i];
                lpShares[lps[i]] = shares[i];
                lpDividendDebt[lps[i]] = (shares[i] * accDividendPerShare) / 1e18;
            }
        }
    }

    function _settleLPDividend(address lp) internal {
        if (lpShares[lp] > 0) {
            uint256 pending = ((lpShares[lp] * accDividendPerShare) / 1e18) - lpDividendDebt[lp];
            if (pending > 0) {
                pendingLPDividends[lp] += pending;
            }
        }
    }

    // ============ Staker Management ============

    /// @notice Register or update staker shares
    /// @param staker The staker address
    /// @param shares The new share amount
    function setStakerShares(address staker, uint256 shares) external onlyOwner {
        if (staker == address(0)) revert ZeroAddress();

        // Settle pending first
        _settleStakerReward(staker);

        totalStakerShares = totalStakerShares - stakerShares[staker] + shares;
        stakerShares[staker] = shares;
        stakerRewardDebt[staker] = (shares * accStakerRewardPerShare) / 1e18;
    }

    function _settleStakerReward(address staker) internal {
        if (stakerShares[staker] > 0) {
            uint256 pending = ((stakerShares[staker] * accStakerRewardPerShare) / 1e18) - stakerRewardDebt[staker];
            if (pending > 0) {
                pendingStakerRewards[staker] += pending;
            }
        }
    }

    // ============ Claiming ============

    /// @inheritdoc IMevaVault
    function claimLPDividend() external override nonReentrant returns (uint256 amount) {
        _settleLPDividend(msg.sender);

        amount = pendingLPDividends[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingLPDividends[msg.sender] = 0;
        lpDividendDebt[msg.sender] = (lpShares[msg.sender] * accDividendPerShare) / 1e18;

        totalDistributed += amount;
        lpPool -= amount;

        dividendToken.safeTransfer(msg.sender, amount);

        emit DividendClaimed(msg.sender, amount, ClaimType.LP);
    }

    /// @inheritdoc IMevaVault
    function claimRebate() external override nonReentrant returns (uint256 amount) {
        amount = victimRebates[msg.sender];
        if (amount == 0) revert NothingToClaim();

        victimRebates[msg.sender] = 0;
        totalPendingRebates -= amount;
        totalDistributed += amount;

        dividendToken.safeTransfer(msg.sender, amount);

        emit DividendClaimed(msg.sender, amount, ClaimType.Victim);
    }

    /// @inheritdoc IMevaVault
    function claimStakerReward() external override nonReentrant returns (uint256 amount) {
        _settleStakerReward(msg.sender);

        amount = pendingStakerRewards[msg.sender];
        if (amount == 0) revert NothingToClaim();

        pendingStakerRewards[msg.sender] = 0;
        stakerRewardDebt[msg.sender] = (stakerShares[msg.sender] * accStakerRewardPerShare) / 1e18;
        totalDistributed += amount;
        stakerPool -= amount;

        dividendToken.safeTransfer(msg.sender, amount);

        emit DividendClaimed(msg.sender, amount, ClaimType.Staker);
    }

    // ============ View Functions ============

    /// @inheritdoc IMevaVault
    function pendingLPDividend(address lp) external view override returns (uint256) {
        uint256 pending = pendingLPDividends[lp];
        if (lpShares[lp] > 0) {
            pending += ((lpShares[lp] * accDividendPerShare) / 1e18) - lpDividendDebt[lp];
        }
        return pending;
    }

    /// @inheritdoc IMevaVault
    function pendingRebate(address victim) external view override returns (uint256) {
        return victimRebates[victim];
    }

    /// @notice Get pending staker reward
    /// @param staker The staker address
    /// @return The pending reward amount
    function pendingStakerReward(address staker) external view returns (uint256) {
        uint256 pending = pendingStakerRewards[staker];
        if (stakerShares[staker] > 0) {
            pending += ((stakerShares[staker] * accStakerRewardPerShare) / 1e18) - stakerRewardDebt[staker];
        }
        return pending;
    }

    /// @inheritdoc IMevaVault
    function getStats()
        external
        view
        override
        returns (uint256 _totalCollected, uint256 _totalDistributed, uint256 _currentEpoch)
    {
        return (totalCollected, totalDistributed, currentEpoch);
    }

    /// @notice Get pool balances
    /// @return _lpPool LP pool balance
    /// @return _stakerPool Staker pool balance
    /// @return _victimPool Victim pool balance (pending rebates)
    function getPoolBalances()
        external
        view
        returns (uint256 _lpPool, uint256 _stakerPool, uint256 _victimPool)
    {
        return (lpPool, stakerPool, totalPendingRebates);
    }

    // ============ Admin Functions ============

    /// @notice Advance to next epoch
    function advanceEpoch() external onlyOwner {
        currentEpoch++;
        emit EpochAdvanced(currentEpoch, totalCollected);
    }

    /// @notice Emergency withdraw (owner only)
    /// @param token Token to withdraw (address(0) for ETH)
    /// @param amount Amount to withdraw
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success,) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
    }

    /// @notice Receive ETH
    receive() external payable {}
}
