// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {BalanceDelta} from "@uniswap/v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "@uniswap/v4-core/src/types/BeforeSwapDelta.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {SwapParams} from "@uniswap/v4-core/src/types/PoolOperation.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IBotRegistry} from "./interfaces/IBotRegistry.sol";
import {IMevaVault} from "./interfaces/IMevaVault.sol";

/// @title MevaHook - MEV Capture and Redistribution Hook
/// @notice Uniswap v4 hook that detects MEV bots and applies dynamic taxes
/// @dev The tax is redistributed as dividends to LPs and sandwich victims
contract MevaHook is BaseHook {
    using LPFeeLibrary for uint24;

    // ============ Constants ============

    /// @notice Tax rates (in hundredths of a bip, 1000000 = 100%)
    uint24 public constant UNLICENSED_BOT_TAX = 500000; // 50%
    uint24 public constant LICENSED_BOT_TAX = 100000; // 10%
    uint24 public constant SUSPICIOUS_TAX = 250000; // 25%
    uint24 public constant NORMAL_FEE = 3000; // 0.3%

    /// @notice Bot detection thresholds
    uint256 public constant HIGH_GAS_MULTIPLIER = 3; // 3x average = suspicious
    uint256 public constant LARGE_SWAP_THRESHOLD = 10000e18; // 10k tokens

    // ============ State Variables ============

    /// @notice Bot registry for known bot addresses
    IBotRegistry public immutable botRegistry;

    /// @notice Vault for dividend distribution
    IMevaVault public immutable mevaVault;

    /// @notice Total MEV tax captured
    uint256 public totalTaxCaptured;

    /// @notice Tax paid per bot address
    mapping(address => uint256) public totalTaxPaid;

    /// @notice Swap count per address (for pattern detection)
    mapping(address => uint256) public swapCount;

    /// @notice Last swap block per address (for rapid-fire detection)
    mapping(address => uint256) public lastSwapBlock;

    /// @notice Average gas price (rolling average)
    uint256 public averageGasPrice = 30 gwei;

    /// @notice Gas price sample count for averaging
    uint256 private _gasPriceSampleCount;

    // ============ Pending Capture Tracking ============

    /// @notice Information about a pending tax capture
    struct PendingCapture {
        uint256 confidence;
        string reason;
        uint24 taxRate;
        bool isPending;
    }

    /// @notice Pending captures by transaction sender
    mapping(address => PendingCapture) private _pendingCaptures;

    // ============ Events ============

    /// @notice Emitted when MEV is captured
    event MEVCaptured(
        address indexed bot, address indexed pool, uint256 taxAmount, uint256 confidence, string reason
    );

    /// @notice Emitted when a suspicious swap is detected
    event SuspiciousSwapDetected(address indexed sender, uint256 confidence, string reason);

    /// @notice Emitted when bot detection parameters are updated
    event DetectionParamsUpdated(uint256 newGasMultiplier, uint256 newSwapThreshold);

    // ============ Errors ============

    error InvalidBotRegistry();
    error InvalidVault();

    // ============ Constructor ============

    constructor(IPoolManager _poolManager, IBotRegistry _botRegistry, IMevaVault _mevaVault) BaseHook(_poolManager) {
        if (address(_botRegistry) == address(0)) revert InvalidBotRegistry();
        if (address(_mevaVault) == address(0)) revert InvalidVault();

        botRegistry = _botRegistry;
        mevaVault = _mevaVault;
    }

    // ============ Hook Permissions ============

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true, // Check for bots, determine tax rate
            afterSwap: true, // Log capture, update stats
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false, // We don't modify swap amounts
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ============ Core Hook Logic ============

    /// @notice Called before each swap to analyze for MEV and set dynamic fee
    function _beforeSwap(address sender, PoolKey calldata, SwapParams calldata params, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        // Analyze the transaction for MEV patterns
        (bool isBot, uint256 confidence, string memory reason) =
            analyzeTransaction(sender, params.amountSpecified, tx.gasprice);

        uint24 dynamicFee;

        if (isBot) {
            // Check if bot is licensed (pays lower tax)
            bool isLicensed = botRegistry.isLicensed(sender);
            dynamicFee = isLicensed ? LICENSED_BOT_TAX : UNLICENSED_BOT_TAX;

            // Store pending capture info
            _pendingCaptures[sender] =
                PendingCapture({confidence: confidence, reason: reason, taxRate: dynamicFee, isPending: true});

            emit SuspiciousSwapDetected(sender, confidence, reason);
        } else if (confidence > 50) {
            // Suspicious but not confirmed bot
            dynamicFee = SUSPICIOUS_TAX;

            _pendingCaptures[sender] =
                PendingCapture({confidence: confidence, reason: reason, taxRate: dynamicFee, isPending: true});
        } else {
            // Normal user
            dynamicFee = NORMAL_FEE;
        }

        // Update swap tracking
        swapCount[sender]++;
        lastSwapBlock[sender] = block.number;

        // Update gas price average
        _updateGasPriceAverage(tx.gasprice);

        // Return the dynamic fee with override flag
        return (this.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, dynamicFee | LPFeeLibrary.OVERRIDE_FEE_FLAG);
    }

    /// @notice Called after each swap to log captures and update stats
    function _afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        PendingCapture memory capture = _pendingCaptures[sender];

        if (capture.isPending && capture.taxRate > NORMAL_FEE) {
            // Calculate the swap amount for tax estimation
            uint256 swapAmount;
            if (params.amountSpecified < 0) {
                swapAmount = uint256(-params.amountSpecified);
            } else {
                swapAmount = uint256(params.amountSpecified);
            }

            // Calculate tax amount (this is approximate - actual fee was applied by pool manager)
            uint256 taxAmount = (swapAmount * capture.taxRate) / 1000000;

            // Update stats
            totalTaxCaptured += taxAmount;
            totalTaxPaid[sender] += taxAmount;

            // Get pool address for logging
            address pool = address(uint160(uint256(keccak256(abi.encode(key)))));

            emit MEVCaptured(sender, pool, taxAmount, capture.confidence, capture.reason);
        }

        // Clear pending capture
        delete _pendingCaptures[sender];

        return (this.afterSwap.selector, 0);
    }

    // ============ Bot Detection Logic ============

    /// @notice Analyze a transaction for MEV bot patterns
    /// @param sender The transaction sender
    /// @param amountSpecified The swap amount
    /// @param gasPrice The transaction gas price
    /// @return isBot Whether the sender is likely a bot
    /// @return confidence Confidence score (0-100)
    /// @return reason The primary reason for classification
    function analyzeTransaction(address sender, int256 amountSpecified, uint256 gasPrice)
        public
        view
        returns (bool isBot, uint256 confidence, string memory reason)
    {
        uint256 score = 0;
        string memory detectedReason = "";

        // Check 1: Known bot registry
        if (botRegistry.isKnownBot(sender)) {
            return (true, 100, "Known bot address");
        }

        // Check 2: High gas price (bots often use high gas for priority)
        if (gasPrice > averageGasPrice * HIGH_GAS_MULTIPLIER) {
            score += 35;
            detectedReason = "High gas price";
        }

        // Check 3: Contract caller (most bots are contracts)
        if (_isContract(sender)) {
            score += 25;
            if (bytes(detectedReason).length == 0) {
                detectedReason = "Contract caller";
            }
        }

        // Check 4: Large swap amount
        uint256 absAmount = amountSpecified > 0 ? uint256(amountSpecified) : uint256(-amountSpecified);
        if (absAmount > LARGE_SWAP_THRESHOLD) {
            score += 15;
            if (bytes(detectedReason).length == 0) {
                detectedReason = "Large swap";
            }
        }

        // Check 5: Rapid-fire swaps (same block = likely bot)
        if (lastSwapBlock[sender] == block.number) {
            score += 20;
            if (bytes(detectedReason).length == 0) {
                detectedReason = "Rapid-fire swaps";
            }
        }

        // Check 6: High swap frequency
        if (swapCount[sender] > 100) {
            score += 10;
            if (bytes(detectedReason).length == 0) {
                detectedReason = "High swap frequency";
            }
        }

        isBot = score >= 60;
        confidence = score > 100 ? 100 : score;
        reason = bytes(detectedReason).length > 0 ? detectedReason : "Normal activity";
    }

    /// @notice Check if an address is a contract
    function _isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /// @notice Update the rolling average gas price
    function _updateGasPriceAverage(uint256 newGasPrice) internal {
        _gasPriceSampleCount++;

        // Simple exponential moving average
        if (_gasPriceSampleCount == 1) {
            averageGasPrice = newGasPrice;
        } else {
            // Weight new sample at 1%
            averageGasPrice = (averageGasPrice * 99 + newGasPrice) / 100;
        }
    }

    // ============ View Functions ============

    /// @notice Get capture statistics
    /// @return _totalCaptured Total MEV tax captured
    /// @return _averageGasPrice Current average gas price
    function getStats() external view returns (uint256 _totalCaptured, uint256 _averageGasPrice) {
        return (totalTaxCaptured, averageGasPrice);
    }

    /// @notice Get bot statistics for an address
    /// @param bot The address to query
    /// @return taxPaid Total tax paid by this address
    /// @return swaps Total swaps by this address
    /// @return isKnown Whether address is in known bot registry
    /// @return isLicensed Whether address is a licensed bot
    function getBotStats(address bot)
        external
        view
        returns (uint256 taxPaid, uint256 swaps, bool isKnown, bool isLicensed)
    {
        return (totalTaxPaid[bot], swapCount[bot], botRegistry.isKnownBot(bot), botRegistry.isLicensed(bot));
    }

    /// @notice Preview what tax rate would apply to a hypothetical swap
    /// @param sender The sender address
    /// @param amountSpecified The swap amount
    /// @param gasPrice The gas price
    /// @return taxRate The tax rate that would be applied
    /// @return confidence The confidence score
    /// @return reason The detection reason
    function previewTaxRate(address sender, int256 amountSpecified, uint256 gasPrice)
        external
        view
        returns (uint24 taxRate, uint256 confidence, string memory reason)
    {
        (bool isBot, uint256 conf, string memory detectReason) = analyzeTransaction(sender, amountSpecified, gasPrice);

        if (isBot) {
            bool isLicensed = botRegistry.isLicensed(sender);
            taxRate = isLicensed ? LICENSED_BOT_TAX : UNLICENSED_BOT_TAX;
        } else if (conf > 50) {
            taxRate = SUSPICIOUS_TAX;
        } else {
            taxRate = NORMAL_FEE;
        }

        return (taxRate, conf, detectReason);
    }
}
