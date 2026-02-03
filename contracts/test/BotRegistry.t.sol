// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {BotRegistry} from "../src/BotRegistry.sol";
import {IBotRegistry} from "../src/interfaces/IBotRegistry.sol";

contract BotRegistryTest is Test {
    BotRegistry public registry;

    address public owner = address(this);
    address public treasury = makeAddr("treasury");
    address public bot1 = makeAddr("bot1");
    address public bot2 = makeAddr("bot2");
    address public user = makeAddr("user");

    event BotAdded(address indexed bot, string reason);
    event BotRemoved(address indexed bot);
    event BotLicensed(address indexed bot);
    event BotLicenseRevoked(address indexed bot);

    function setUp() public {
        registry = new BotRegistry(treasury);
    }

    // ============ Basic Bot Management ============

    function test_AddBot() public {
        vm.expectEmit(true, false, false, true);
        emit BotAdded(bot1, "Sandwich bot");

        registry.addBot(bot1, "Sandwich bot");

        assertTrue(registry.isKnownBot(bot1));
        assertFalse(registry.isLicensed(bot1));
        assertEq(registry.botCount(), 1);

        (string memory reason, uint256 addedAt, bool licensed) = registry.getBotInfo(bot1);
        assertEq(reason, "Sandwich bot");
        assertGt(addedAt, 0);
        assertFalse(licensed);
    }

    function test_AddBot_RevertIfAlreadyRegistered() public {
        registry.addBot(bot1, "First");

        vm.expectRevert(BotRegistry.BotAlreadyRegistered.selector);
        registry.addBot(bot1, "Second");
    }

    function test_AddBot_OnlyOwner() public {
        vm.prank(user);
        vm.expectRevert();
        registry.addBot(bot1, "Unauthorized");
    }

    function test_RemoveBot() public {
        registry.addBot(bot1, "Test");
        assertTrue(registry.isKnownBot(bot1));

        vm.expectEmit(true, false, false, false);
        emit BotRemoved(bot1);

        registry.removeBot(bot1);

        assertFalse(registry.isKnownBot(bot1));
        assertEq(registry.botCount(), 0);
    }

    function test_RemoveBot_RevertIfNotRegistered() public {
        vm.expectRevert(BotRegistry.BotNotRegistered.selector);
        registry.removeBot(bot1);
    }

    // ============ Bot Licensing ============

    function test_RegisterAsLicensed() public {
        vm.deal(bot1, 1 ether);

        vm.prank(bot1);
        vm.expectEmit(true, false, false, true);
        emit BotAdded(bot1, "Self-registered");
        vm.expectEmit(true, false, false, false);
        emit BotLicensed(bot1);

        registry.registerAsLicensed{value: 0.1 ether}();

        assertTrue(registry.isKnownBot(bot1));
        assertTrue(registry.isLicensed(bot1));
        assertEq(registry.licensedBotCount(), 1);
        assertEq(treasury.balance, 0.1 ether);
    }

    function test_RegisterAsLicensed_ExistingBot() public {
        // First add as known bot
        registry.addBot(bot1, "Known sandwich bot");

        // Then self-register as licensed
        vm.deal(bot1, 1 ether);
        vm.prank(bot1);
        registry.registerAsLicensed{value: 0.1 ether}();

        assertTrue(registry.isKnownBot(bot1));
        assertTrue(registry.isLicensed(bot1));

        (string memory reason,,) = registry.getBotInfo(bot1);
        assertEq(reason, "Known sandwich bot"); // Original reason preserved
    }

    function test_RegisterAsLicensed_RevertIfInsufficientFee() public {
        vm.deal(bot1, 1 ether);
        vm.prank(bot1);

        vm.expectRevert(BotRegistry.InsufficientLicenseFee.selector);
        registry.registerAsLicensed{value: 0.05 ether}();
    }

    function test_RegisterAsLicensed_RevertIfAlreadyLicensed() public {
        vm.deal(bot1, 1 ether);
        vm.prank(bot1);
        registry.registerAsLicensed{value: 0.1 ether}();

        vm.prank(bot1);
        vm.expectRevert(BotRegistry.BotAlreadyLicensed.selector);
        registry.registerAsLicensed{value: 0.1 ether}();
    }

    function test_RevokeLicense() public {
        vm.deal(bot1, 1 ether);
        vm.prank(bot1);
        registry.registerAsLicensed{value: 0.1 ether}();

        assertTrue(registry.isLicensed(bot1));
        assertEq(registry.licensedBotCount(), 1);

        vm.expectEmit(true, false, false, false);
        emit BotLicenseRevoked(bot1);

        registry.revokeLicense(bot1);

        assertFalse(registry.isLicensed(bot1));
        assertTrue(registry.isKnownBot(bot1)); // Still known
        assertEq(registry.licensedBotCount(), 0);
    }

    // ============ Batch Operations ============

    function test_AddBotsBatch() public {
        address[] memory bots = new address[](3);
        bots[0] = bot1;
        bots[1] = bot2;
        bots[2] = user;

        string[] memory reasons = new string[](3);
        reasons[0] = "Bot 1";
        reasons[1] = "Bot 2";
        reasons[2] = "Bot 3";

        registry.addBotsBatch(bots, reasons);

        assertEq(registry.botCount(), 3);
        assertTrue(registry.isKnownBot(bot1));
        assertTrue(registry.isKnownBot(bot2));
        assertTrue(registry.isKnownBot(user));
    }

    function test_AddBotsBatch_SkipsDuplicates() public {
        registry.addBot(bot1, "Already exists");

        address[] memory bots = new address[](2);
        bots[0] = bot1; // Duplicate
        bots[1] = bot2;

        string[] memory reasons = new string[](2);
        reasons[0] = "Duplicate";
        reasons[1] = "New";

        registry.addBotsBatch(bots, reasons);

        assertEq(registry.botCount(), 2);
        (string memory reason,,) = registry.getBotInfo(bot1);
        assertEq(reason, "Already exists"); // Original preserved
    }

    // ============ View Functions ============

    function test_GetAllBots() public {
        registry.addBot(bot1, "Bot 1");
        registry.addBot(bot2, "Bot 2");

        address[] memory allBots = registry.getAllBots();

        assertEq(allBots.length, 2);
        assertEq(allBots[0], bot1);
        assertEq(allBots[1], bot2);
    }

    function test_GetAllBots_AfterRemoval() public {
        registry.addBot(bot1, "Bot 1");
        registry.addBot(bot2, "Bot 2");
        registry.addBot(user, "Bot 3");

        registry.removeBot(bot1);

        address[] memory allBots = registry.getAllBots();

        assertEq(allBots.length, 2);
        // After removal, last element fills the gap
        assertEq(allBots[0], user);
        assertEq(allBots[1], bot2);
    }

    // ============ Admin Functions ============

    function test_SetTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        registry.setTreasury(newTreasury);
        assertEq(registry.treasury(), newTreasury);
    }

    function test_Withdraw() public {
        // Send some ETH to contract
        vm.deal(address(registry), 1 ether);

        uint256 treasuryBalanceBefore = treasury.balance;
        registry.withdraw();
        uint256 treasuryBalanceAfter = treasury.balance;

        assertEq(treasuryBalanceAfter - treasuryBalanceBefore, 1 ether);
    }
}
