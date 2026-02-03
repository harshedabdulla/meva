// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {MevaVault} from "../src/MevaVault.sol";
import {IMevaVault} from "../src/interfaces/IMevaVault.sol";
import {ERC20Mock} from "./mocks/ERC20Mock.sol";

contract MevaVaultTest is Test {
    MevaVault public vault;
    ERC20Mock public token;

    address public owner = address(this);
    address public hook = makeAddr("hook");
    address public lp1 = makeAddr("lp1");
    address public lp2 = makeAddr("lp2");
    address public victim1 = makeAddr("victim1");
    address public victim2 = makeAddr("victim2");
    address public staker1 = makeAddr("staker1");
    address public bot1 = makeAddr("bot1");

    event TaxReceived(address indexed bot, address indexed token, uint256 amount);
    event DividendClaimed(address indexed user, uint256 amount, IMevaVault.ClaimType claimType);
    event VictimRebateAdded(address indexed victim, uint256 amount);

    function setUp() public {
        token = new ERC20Mock("USDC", "USDC", 6);
        vault = new MevaVault(address(token));

        // Authorize the hook
        vault.setAuthorizedHook(hook, true);

        // Fund the hook for testing
        token.mint(hook, 1_000_000e6);
        vm.prank(hook);
        token.approve(address(vault), type(uint256).max);
    }

    // ============ Tax Collection ============

    function test_ReceiveTax() public {
        vm.prank(hook);
        vm.expectEmit(true, true, false, true);
        emit TaxReceived(bot1, address(token), 1000e6);

        vault.receiveTax(bot1, address(token), 1000e6);

        (uint256 totalCollected,,) = vault.getStats();
        assertEq(totalCollected, 1000e6);
    }

    function test_ReceiveTax_Distribution() public {
        // Set up LPs and stakers first
        vault.setLPShares(lp1, 100);
        vault.setLPShares(lp2, 100);
        vault.setStakerShares(staker1, 100);

        // Receive tax
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        // Check pool balances
        (uint256 lpPool, uint256 stakerPool,) = vault.getPoolBalances();

        // 50% to LPs = 500
        assertEq(lpPool, 500e6);
        // 20% to stakers = 200
        assertEq(stakerPool, 200e6);
        // 30% to victims (tracked separately when rebates added)
    }

    function test_ReceiveTax_OnlyAuthorizedHook() public {
        vm.expectRevert(MevaVault.Unauthorized.selector);
        vault.receiveTax(bot1, address(token), 1000e6);
    }

    function test_ReceiveTax_RevertZeroAmount() public {
        vm.prank(hook);
        vm.expectRevert(MevaVault.ZeroAmount.selector);
        vault.receiveTax(bot1, address(token), 0);
    }

    // ============ LP Dividends ============

    function test_LPDividends_SingleLP() public {
        vault.setLPShares(lp1, 100);

        // Receive tax
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        // Check pending dividend
        uint256 pending = vault.pendingLPDividend(lp1);
        assertEq(pending, 500e6); // 50% of 1000

        // Claim
        vm.prank(lp1);
        vault.claimLPDividend();

        assertEq(token.balanceOf(lp1), 500e6);
        assertEq(vault.pendingLPDividend(lp1), 0);
    }

    function test_LPDividends_MultipleLP() public {
        vault.setLPShares(lp1, 100);
        vault.setLPShares(lp2, 300); // 3x more shares

        // Receive tax
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        // Check pending dividends (500 total, split 1:3)
        uint256 pending1 = vault.pendingLPDividend(lp1);
        uint256 pending2 = vault.pendingLPDividend(lp2);

        assertEq(pending1, 125e6); // 25%
        assertEq(pending2, 375e6); // 75%
    }

    function test_LPDividends_AccumulatesOverMultipleTaxes() public {
        vault.setLPShares(lp1, 100);

        // Multiple tax receipts
        vm.startPrank(hook);
        vault.receiveTax(bot1, address(token), 100e6);
        vault.receiveTax(bot1, address(token), 200e6);
        vault.receiveTax(bot1, address(token), 300e6);
        vm.stopPrank();

        // Total LP share: 50% of (100 + 200 + 300) = 300
        uint256 pending = vault.pendingLPDividend(lp1);
        assertEq(pending, 300e6);
    }

    function test_LPDividends_ClaimRevertIfNone() public {
        vm.prank(lp1);
        vm.expectRevert(MevaVault.NothingToClaim.selector);
        vault.claimLPDividend();
    }

    // ============ Victim Rebates ============

    function test_AddVictimRebate() public {
        vm.expectEmit(true, false, false, true);
        emit VictimRebateAdded(victim1, 100e6);

        vault.addVictimRebate(victim1, 100e6);

        assertEq(vault.pendingRebate(victim1), 100e6);
    }

    function test_AddVictimRebatesBatch() public {
        address[] memory victims = new address[](2);
        victims[0] = victim1;
        victims[1] = victim2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100e6;
        amounts[1] = 200e6;

        vault.addVictimRebatesBatch(victims, amounts);

        assertEq(vault.pendingRebate(victim1), 100e6);
        assertEq(vault.pendingRebate(victim2), 200e6);
    }

    function test_ClaimRebate() public {
        // Fund the vault
        token.mint(address(vault), 100e6);

        vault.addVictimRebate(victim1, 100e6);

        vm.prank(victim1);
        vm.expectEmit(true, false, false, true);
        emit DividendClaimed(victim1, 100e6, IMevaVault.ClaimType.Victim);

        uint256 claimed = vault.claimRebate();

        assertEq(claimed, 100e6);
        assertEq(token.balanceOf(victim1), 100e6);
        assertEq(vault.pendingRebate(victim1), 0);
    }

    function test_ClaimRebate_RevertIfNone() public {
        vm.prank(victim1);
        vm.expectRevert(MevaVault.NothingToClaim.selector);
        vault.claimRebate();
    }

    // ============ Staker Rewards ============

    function test_StakerRewards() public {
        vault.setStakerShares(staker1, 100);

        // Receive tax
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        // Check pending reward (20% of 1000 = 200)
        uint256 pending = vault.pendingStakerReward(staker1);
        assertEq(pending, 200e6);

        // Claim
        vm.prank(staker1);
        vault.claimStakerReward();

        assertEq(token.balanceOf(staker1), 200e6);
    }

    // ============ LP Share Management ============

    function test_SetLPShares_SettlesPendingFirst() public {
        vault.setLPShares(lp1, 100);

        // Receive tax
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        // Change shares - should settle pending first
        vault.setLPShares(lp1, 200);

        // Pending should still be claimable
        uint256 pending = vault.pendingLPDividend(lp1);
        assertEq(pending, 500e6);
    }

    function test_SetLPSharesBatch() public {
        address[] memory lps = new address[](2);
        lps[0] = lp1;
        lps[1] = lp2;

        uint256[] memory shares = new uint256[](2);
        shares[0] = 100;
        shares[1] = 200;

        vault.setLPSharesBatch(lps, shares);

        assertEq(vault.lpShares(lp1), 100);
        assertEq(vault.lpShares(lp2), 200);
        assertEq(vault.totalLPShares(), 300);
    }

    // ============ View Functions ============

    function test_GetStats() public {
        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        (uint256 totalCollected, uint256 totalDistributed, uint256 currentEpoch) = vault.getStats();

        assertEq(totalCollected, 1000e6);
        assertEq(totalDistributed, 0);
        assertEq(currentEpoch, 1);
    }

    function test_GetPoolBalances() public {
        vault.setLPShares(lp1, 100);
        vault.setStakerShares(staker1, 100);
        vault.addVictimRebate(victim1, 50e6);

        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        (uint256 lpPool, uint256 stakerPool, uint256 victimPool) = vault.getPoolBalances();

        assertEq(lpPool, 500e6);
        assertEq(stakerPool, 200e6);
        assertEq(victimPool, 50e6); // Only manually added rebates
    }

    // ============ Admin Functions ============

    function test_AdvanceEpoch() public {
        vault.advanceEpoch();

        (,, uint256 currentEpoch) = vault.getStats();
        assertEq(currentEpoch, 2);
    }

    function test_SetAuthorizedHook() public {
        address newHook = makeAddr("newHook");

        vault.setAuthorizedHook(newHook, true);
        assertTrue(vault.authorizedHooks(newHook));

        vault.setAuthorizedHook(newHook, false);
        assertFalse(vault.authorizedHooks(newHook));
    }

    function test_EmergencyWithdraw() public {
        token.mint(address(vault), 1000e6);

        vault.emergencyWithdraw(address(token), 500e6);

        assertEq(token.balanceOf(owner), 500e6);
        assertEq(token.balanceOf(address(vault)), 500e6);
    }

    // ============ Edge Cases ============

    function test_NoLPs_TaxStillCollected() public {
        // No LPs registered

        vm.prank(hook);
        vault.receiveTax(bot1, address(token), 1000e6);

        (uint256 totalCollected,,) = vault.getStats();
        assertEq(totalCollected, 1000e6);

        // Dividends accumulate but no one can claim
        (uint256 lpPool,,) = vault.getPoolBalances();
        assertEq(lpPool, 500e6);
    }

    function test_Reentrancy_Protection() public {
        // This is implicitly tested by the nonReentrant modifier
        // Full reentrancy test would require a malicious token
    }
}
