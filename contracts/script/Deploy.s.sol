// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console2} from "forge-std/Script.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "@uniswap/v4-periphery/src/utils/HookMiner.sol";

import {BotRegistry} from "../src/BotRegistry.sol";
import {MevaVault} from "../src/MevaVault.sol";
import {MevaHook} from "../src/MevaHook.sol";

/// @title Deploy Script for MEVA Protocol
/// @notice Deploys BotRegistry, MevaVault, and MevaHook
contract DeployMeva is Script {
    // Configuration
    address public constant POOL_MANAGER = address(0); // Set before deployment
    address public constant USDC = address(0); // Set before deployment
    address public treasury;

    function setUp() public {
        // Default treasury to deployer
        treasury = msg.sender;
    }

    function run() public returns (BotRegistry, MevaVault, MevaHook) {
        // Load configuration from environment
        address poolManager = vm.envOr("POOL_MANAGER", POOL_MANAGER);
        address usdc = vm.envOr("USDC", USDC);
        treasury = vm.envOr("TREASURY", treasury);

        require(poolManager != address(0), "POOL_MANAGER not set");
        require(usdc != address(0), "USDC not set");

        vm.startBroadcast();

        // 1. Deploy BotRegistry
        BotRegistry botRegistry = new BotRegistry(treasury);
        console2.log("BotRegistry deployed at:", address(botRegistry));

        // 2. Deploy MevaVault
        MevaVault mevaVault = new MevaVault(usdc);
        console2.log("MevaVault deployed at:", address(mevaVault));

        // 3. Mine hook address with correct flags
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG);

        // Find a salt that produces an address with the correct hook flags
        (address hookAddress, bytes32 salt) =
            HookMiner.find(address(this), flags, type(MevaHook).creationCode, abi.encode(poolManager, botRegistry, mevaVault));

        console2.log("Hook address found:", hookAddress);
        console2.log("Salt:", vm.toString(salt));

        // 4. Deploy MevaHook to the mined address
        MevaHook hook = new MevaHook{salt: salt}(IPoolManager(poolManager), botRegistry, mevaVault);

        require(address(hook) == hookAddress, "Hook address mismatch");
        console2.log("MevaHook deployed at:", address(hook));

        // 5. Authorize the hook in the vault
        mevaVault.setAuthorizedHook(address(hook), true);
        console2.log("Hook authorized in vault");

        vm.stopBroadcast();

        return (botRegistry, mevaVault, hook);
    }
}

/// @title Deploy Script for Local Testing
/// @notice Simplified deployment without hook address mining
contract DeployMevaLocal is Script {
    function run() public returns (BotRegistry, MevaVault) {
        vm.startBroadcast();

        // Deploy mock USDC
        address usdc = address(new MockUSDC());
        console2.log("Mock USDC deployed at:", usdc);

        // Deploy BotRegistry
        BotRegistry botRegistry = new BotRegistry(msg.sender);
        console2.log("BotRegistry deployed at:", address(botRegistry));

        // Deploy MevaVault
        MevaVault mevaVault = new MevaVault(usdc);
        console2.log("MevaVault deployed at:", address(mevaVault));

        // Add some test bots
        botRegistry.addBot(address(0x1234), "Test bot 1");
        botRegistry.addBot(address(0x5678), "Test bot 2");

        vm.stopBroadcast();

        return (botRegistry, mevaVault);
    }
}

/// @title Simple Mock USDC for testing
contract MockUSDC {
    string public constant name = "USD Coin";
    string public constant symbol = "USDC";
    uint8 public constant decimals = 6;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
}
