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
    // Sepolia testnet addresses (Uniswap V4)
    address public constant SEPOLIA_POOL_MANAGER = 0xE03A1074c86CFeDd5C142C4F04F1a1536e203543;
    address public constant SEPOLIA_USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    // Mainnet addresses (Uniswap V4)
    address public constant MAINNET_POOL_MANAGER = 0x000000000004444c5dc75cB358380D2e3dE08A90;
    address public constant MAINNET_USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;

    address public treasury;

    function setUp() public {
        // Default treasury to deployer
        treasury = msg.sender;
    }

    function run() public returns (BotRegistry, MevaVault, MevaHook) {
        // Get the deployer address from private key
        // Note: PRIVATE_KEY must have 0x prefix in .env file
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        // Auto-detect network and set addresses
        address poolManager;
        address usdc;

        if (block.chainid == 11155111) {
            // Sepolia
            poolManager = SEPOLIA_POOL_MANAGER;
            usdc = SEPOLIA_USDC;
            console2.log("Deploying to Sepolia testnet");
        } else if (block.chainid == 1) {
            // Mainnet
            poolManager = MAINNET_POOL_MANAGER;
            usdc = MAINNET_USDC;
            console2.log("Deploying to Ethereum mainnet");
        } else {
            // Allow override for other networks
            poolManager = vm.envAddress("POOL_MANAGER");
            usdc = vm.envAddress("USDC");
            console2.log("Deploying to chain:", block.chainid);
        }

        treasury = vm.envOr("TREASURY", deployer);
        console2.log("Deployer:", deployer);

        require(poolManager != address(0), "POOL_MANAGER not set");
        require(usdc != address(0), "USDC not set");

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy BotRegistry
        BotRegistry botRegistry = new BotRegistry(treasury);
        console2.log("BotRegistry deployed at:", address(botRegistry));

        // 2. Deploy MevaVault
        MevaVault mevaVault = new MevaVault(usdc);
        console2.log("MevaVault deployed at:", address(mevaVault));

        // 3. Mine hook address with correct flags
        // Hook flags: BEFORE_SWAP (bit 7) and AFTER_SWAP (bit 6)
        uint160 flags = uint160(Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG);

        // Find a salt that produces an address with the correct hook flags
        // Use deployer address (EOA) for CREATE2 computation
        (address hookAddress, bytes32 salt) =
            HookMiner.find(deployer, flags, type(MevaHook).creationCode, abi.encode(poolManager, botRegistry, mevaVault));

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

/// @title Deploy Script for Testnet (without hook)
/// @notice Deploys BotRegistry and MevaVault for demo purposes
contract DeployMevaTestnet is Script {
    // Sepolia testnet addresses
    address public constant SEPOLIA_USDC = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;

    function run() public returns (BotRegistry, MevaVault) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deploying to Sepolia testnet (demo mode)");
        console2.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy BotRegistry
        BotRegistry botRegistry = new BotRegistry(deployer);
        console2.log("BotRegistry deployed at:", address(botRegistry));

        // Deploy MevaVault with real USDC
        MevaVault mevaVault = new MevaVault(SEPOLIA_USDC);
        console2.log("MevaVault deployed at:", address(mevaVault));

        // Add some known bot addresses for demo
        botRegistry.addBot(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D, "Uniswap V2 Router");
        botRegistry.addBot(0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45, "Uniswap Router 02");
        console2.log("Demo bots added to registry");

        vm.stopBroadcast();

        console2.log("");
        console2.log("=== DEPLOYMENT COMPLETE ===");
        console2.log("BotRegistry:", address(botRegistry));
        console2.log("MevaVault:", address(mevaVault));
        console2.log("");
        console2.log("Note: MevaHook requires CREATE2 deployer for proper hook address.");
        console2.log("For full V4 integration, use a dedicated hook deployer contract.");

        return (botRegistry, mevaVault);
    }
}

/// @title Deploy Script for Local Testing
/// @notice Simplified deployment with mock tokens
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
