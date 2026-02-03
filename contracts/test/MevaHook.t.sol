// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolManager} from "@uniswap/v4-core/src/PoolManager.sol";

import {MevaHook} from "../src/MevaHook.sol";
import {BotRegistry} from "../src/BotRegistry.sol";
import {MevaVault} from "../src/MevaVault.sol";
import {ERC20Mock} from "./mocks/ERC20Mock.sol";

import {BaseHook} from "@uniswap/v4-periphery/src/utils/BaseHook.sol";

/// @notice Test harness that skips hook address validation
contract MevaHookHarness is MevaHook {
    constructor(IPoolManager _poolManager, BotRegistry _botRegistry, MevaVault _mevaVault)
        MevaHook(_poolManager, _botRegistry, _mevaVault)
    {}

    /// @notice Override to skip address validation in tests
    function validateHookAddress(BaseHook) internal pure override {
        // Skip validation for testing
    }
}

contract MevaHookTest is Test {
    MevaHookHarness public hook;
    BotRegistry public botRegistry;
    MevaVault public mevaVault;
    IPoolManager public poolManager;
    ERC20Mock public dividendToken;

    address public treasury = makeAddr("treasury");
    address public normalUser = makeAddr("normalUser");
    address public knownBot = makeAddr("knownBot");

    // Contract-based bot (for contract caller detection)
    BotContract public botContract;

    function setUp() public {
        // Deploy minimal pool manager
        poolManager = new PoolManager(address(this));

        // Deploy bot registry
        botRegistry = new BotRegistry(treasury);

        // Deploy dividend token and vault
        dividendToken = new ERC20Mock("USDC", "USDC", 6);
        mevaVault = new MevaVault(address(dividendToken));

        // Deploy the hook harness (bypasses address validation)
        hook = new MevaHookHarness(poolManager, botRegistry, mevaVault);

        // Authorize the hook in the vault
        mevaVault.setAuthorizedHook(address(hook), true);

        // Setup known bot
        botRegistry.addBot(knownBot, "Known sandwich bot");

        // Setup bot contract
        botContract = new BotContract();
    }

    // ============ Bot Detection Tests ============

    function test_AnalyzeTransaction_KnownBot() public view {
        (bool isBot, uint256 confidence, string memory reason) = hook.analyzeTransaction(knownBot, 1e18, 30 gwei);

        assertTrue(isBot);
        assertEq(confidence, 100);
        assertEq(reason, "Known bot address");
    }

    function test_AnalyzeTransaction_HighGasPrice() public view {
        // Set average gas price (default is 30 gwei)
        // High gas = 3x average = 90 gwei, let's use 100 gwei

        (bool isBot, uint256 confidence, string memory reason) = hook.analyzeTransaction(normalUser, 1e18, 100 gwei);

        // High gas alone gives 35 points, not enough for bot (needs 60)
        assertFalse(isBot);
        assertEq(confidence, 35);
        assertEq(reason, "High gas price");
    }

    function test_AnalyzeTransaction_ContractCaller() public view {
        // Contract caller gets 25 points
        (bool isBot, uint256 confidence, string memory reason) =
            hook.analyzeTransaction(address(botContract), 1e18, 30 gwei);

        assertFalse(isBot);
        assertEq(confidence, 25);
        assertEq(reason, "Contract caller");
    }

    function test_AnalyzeTransaction_HighGasAndContract() public view {
        // High gas (35) + contract (25) = 60 = bot threshold
        (bool isBot, uint256 confidence, string memory reason) =
            hook.analyzeTransaction(address(botContract), 1e18, 100 gwei);

        assertTrue(isBot);
        assertEq(confidence, 60);
        assertEq(reason, "High gas price");
    }

    function test_AnalyzeTransaction_LargeSwap() public view {
        // Large swap > 10000e18 gives 15 points
        (bool isBot, uint256 confidence, string memory reason) = hook.analyzeTransaction(normalUser, 15000e18, 30 gwei);

        assertFalse(isBot);
        assertEq(confidence, 15);
        assertEq(reason, "Large swap");
    }

    function test_AnalyzeTransaction_NormalActivity() public view {
        (bool isBot, uint256 confidence, string memory reason) = hook.analyzeTransaction(normalUser, 1e18, 30 gwei);

        assertFalse(isBot);
        assertEq(confidence, 0);
        assertEq(reason, "Normal activity");
    }

    function test_AnalyzeTransaction_CombinedFactors() public view {
        // High gas (35) + Large swap (15) = 50, not quite bot
        (bool isBot, uint256 confidence,) = hook.analyzeTransaction(normalUser, 15000e18, 100 gwei);

        assertFalse(isBot);
        assertEq(confidence, 50);
    }

    function test_AnalyzeTransaction_FullBotProfile() public view {
        // Contract (25) + High gas (35) + Large swap (15) = 75
        (bool isBot, uint256 confidence,) = hook.analyzeTransaction(address(botContract), 15000e18, 100 gwei);

        assertTrue(isBot);
        assertEq(confidence, 75);
    }

    // ============ Tax Rate Preview ============

    function test_PreviewTaxRate_NormalUser() public view {
        (uint24 taxRate, uint256 confidence, string memory reason) = hook.previewTaxRate(normalUser, 1e18, 30 gwei);

        assertEq(taxRate, hook.NORMAL_FEE());
        assertEq(confidence, 0);
        assertEq(reason, "Normal activity");
    }

    function test_PreviewTaxRate_UnlicensedBot() public view {
        (uint24 taxRate, uint256 confidence, string memory reason) = hook.previewTaxRate(knownBot, 1e18, 30 gwei);

        assertEq(taxRate, hook.UNLICENSED_BOT_TAX());
        assertEq(confidence, 100);
        assertEq(reason, "Known bot address");
    }

    function test_PreviewTaxRate_LicensedBot() public {
        // License the bot
        vm.deal(knownBot, 1 ether);
        vm.prank(knownBot);
        botRegistry.registerAsLicensed{value: 0.1 ether}();

        (uint24 taxRate, uint256 confidence, string memory reason) = hook.previewTaxRate(knownBot, 1e18, 30 gwei);

        assertEq(taxRate, hook.LICENSED_BOT_TAX());
        assertEq(confidence, 100);
        assertEq(reason, "Known bot address");
    }

    function test_PreviewTaxRate_DetectedBot() public view {
        // High gas + contract = detected bot
        (uint24 taxRate, uint256 confidence,) = hook.previewTaxRate(address(botContract), 1e18, 100 gwei);

        assertEq(taxRate, hook.UNLICENSED_BOT_TAX());
        assertEq(confidence, 60);
    }

    function test_PreviewTaxRate_Suspicious() public view {
        // High gas only = 35 points = suspicious but not bot
        (uint24 taxRate, uint256 confidence,) = hook.previewTaxRate(normalUser, 1e18, 100 gwei);

        // 35 < 50, so not even suspicious threshold
        assertEq(taxRate, hook.NORMAL_FEE());
        assertEq(confidence, 35);
    }

    // ============ View Functions ============

    function test_GetStats() public view {
        (uint256 totalCaptured, uint256 avgGasPrice) = hook.getStats();

        assertEq(totalCaptured, 0);
        assertEq(avgGasPrice, 30 gwei); // Initial value
    }

    function test_GetBotStats() public view {
        (uint256 taxPaid, uint256 swaps, bool isKnown, bool isLicensed) = hook.getBotStats(knownBot);

        assertEq(taxPaid, 0);
        assertEq(swaps, 0);
        assertTrue(isKnown);
        assertFalse(isLicensed);
    }

    function test_GetBotStats_AfterLicensing() public {
        vm.deal(knownBot, 1 ether);
        vm.prank(knownBot);
        botRegistry.registerAsLicensed{value: 0.1 ether}();

        (,, bool isKnown, bool isLicensed) = hook.getBotStats(knownBot);

        assertTrue(isKnown);
        assertTrue(isLicensed);
    }

    // ============ Hook Permissions ============

    function test_HookPermissions() public view {
        Hooks.Permissions memory permissions = hook.getHookPermissions();

        assertTrue(permissions.beforeSwap);
        assertTrue(permissions.afterSwap);
        assertFalse(permissions.beforeInitialize);
        assertFalse(permissions.afterInitialize);
        assertFalse(permissions.beforeAddLiquidity);
        assertFalse(permissions.afterAddLiquidity);
        assertFalse(permissions.beforeRemoveLiquidity);
        assertFalse(permissions.afterRemoveLiquidity);
        assertFalse(permissions.beforeSwapReturnDelta);
        assertFalse(permissions.afterSwapReturnDelta);
    }

    // ============ Constants ============

    function test_TaxRateConstants() public view {
        assertEq(hook.UNLICENSED_BOT_TAX(), 500000); // 50%
        assertEq(hook.LICENSED_BOT_TAX(), 100000); // 10%
        assertEq(hook.SUSPICIOUS_TAX(), 250000); // 25%
        assertEq(hook.NORMAL_FEE(), 3000); // 0.3%
    }

    function test_DetectionThresholds() public view {
        assertEq(hook.HIGH_GAS_MULTIPLIER(), 3);
        assertEq(hook.LARGE_SWAP_THRESHOLD(), 10000e18);
    }

    // ============ Immutables ============

    function test_Immutables() public view {
        assertEq(address(hook.botRegistry()), address(botRegistry));
        assertEq(address(hook.mevaVault()), address(mevaVault));
    }

    // ============ Edge Cases ============

    function test_AnalyzeTransaction_NegativeAmount() public view {
        // Negative amount (exactIn swap)
        (bool isBot, uint256 confidence,) = hook.analyzeTransaction(normalUser, -1e18, 30 gwei);

        assertFalse(isBot);
        assertEq(confidence, 0);
    }

    function test_AnalyzeTransaction_LargeNegativeAmount() public view {
        // Large negative amount
        (bool isBot, uint256 confidence, string memory reason) = hook.analyzeTransaction(normalUser, -15000e18, 30 gwei);

        assertFalse(isBot);
        assertEq(confidence, 15);
        assertEq(reason, "Large swap");
    }

    function test_MaxConfidence_Capped() public view {
        // Known bot should always return 100, not more
        (bool isBot, uint256 confidence,) = hook.analyzeTransaction(knownBot, 15000e18, 100 gwei);

        assertTrue(isBot);
        assertEq(confidence, 100); // Capped at 100
    }
}

/// @notice Simple contract for testing contract caller detection
contract BotContract {
    function execute() external pure returns (bool) {
        return true;
    }
}
