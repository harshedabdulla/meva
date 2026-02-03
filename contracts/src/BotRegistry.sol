// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IBotRegistry} from "./interfaces/IBotRegistry.sol";

/// @title BotRegistry
/// @notice Manages known MEV bots and their licensing status
/// @dev Bots can self-register as "licensed" to pay lower taxes
contract BotRegistry is IBotRegistry, Ownable {
    /// @notice Minimum fee to register as a licensed bot
    uint256 public constant LICENSE_FEE = 0.1 ether;

    /// @notice Information about a registered bot
    struct BotInfo {
        string reason;
        uint256 addedAt;
        bool isBot;
        bool licensed;
    }

    /// @notice Mapping of addresses to bot information
    mapping(address => BotInfo) private _bots;

    /// @notice List of all known bot addresses
    address[] private _botList;

    /// @notice Mapping for quick lookup of bot list index
    mapping(address => uint256) private _botIndex;

    /// @notice Total number of licensed bots
    uint256 public licensedBotCount;

    /// @notice Address to receive license fees
    address public treasury;

    /// @notice Thrown when license fee is insufficient
    error InsufficientLicenseFee();

    /// @notice Thrown when bot is not registered
    error BotNotRegistered();

    /// @notice Thrown when bot is already registered
    error BotAlreadyRegistered();

    /// @notice Thrown when bot is already licensed
    error BotAlreadyLicensed();

    constructor(address _treasury) Ownable(msg.sender) {
        treasury = _treasury;
    }

    /// @inheritdoc IBotRegistry
    function isKnownBot(address bot) external view override returns (bool) {
        return _bots[bot].isBot;
    }

    /// @inheritdoc IBotRegistry
    function isLicensed(address bot) external view override returns (bool) {
        return _bots[bot].licensed;
    }

    /// @inheritdoc IBotRegistry
    function addBot(address bot, string calldata reason) external override onlyOwner {
        if (_bots[bot].isBot) revert BotAlreadyRegistered();

        _bots[bot] = BotInfo({reason: reason, addedAt: block.timestamp, isBot: true, licensed: false});

        _botIndex[bot] = _botList.length;
        _botList.push(bot);

        emit BotAdded(bot, reason);
    }

    /// @inheritdoc IBotRegistry
    function removeBot(address bot) external override onlyOwner {
        if (!_bots[bot].isBot) revert BotNotRegistered();

        if (_bots[bot].licensed) {
            licensedBotCount--;
        }

        // Remove from list by swapping with last element
        uint256 index = _botIndex[bot];
        uint256 lastIndex = _botList.length - 1;

        if (index != lastIndex) {
            address lastBot = _botList[lastIndex];
            _botList[index] = lastBot;
            _botIndex[lastBot] = index;
        }

        _botList.pop();
        delete _botIndex[bot];
        delete _bots[bot];

        emit BotRemoved(bot);
    }

    /// @inheritdoc IBotRegistry
    function registerAsLicensed() external payable override {
        if (msg.value < LICENSE_FEE) revert InsufficientLicenseFee();

        BotInfo storage info = _bots[msg.sender];

        // If not already a known bot, add them
        if (!info.isBot) {
            info.reason = "Self-registered";
            info.addedAt = block.timestamp;
            info.isBot = true;
            _botIndex[msg.sender] = _botList.length;
            _botList.push(msg.sender);
            emit BotAdded(msg.sender, "Self-registered");
        }

        if (info.licensed) revert BotAlreadyLicensed();

        info.licensed = true;
        licensedBotCount++;

        // Transfer fee to treasury
        (bool success,) = treasury.call{value: msg.value}("");
        require(success, "Transfer failed");

        emit BotLicensed(msg.sender);
    }

    /// @inheritdoc IBotRegistry
    function revokeLicense(address bot) external override onlyOwner {
        BotInfo storage info = _bots[bot];
        if (!info.isBot) revert BotNotRegistered();
        if (!info.licensed) return;

        info.licensed = false;
        licensedBotCount--;

        emit BotLicenseRevoked(bot);
    }

    /// @inheritdoc IBotRegistry
    function botCount() external view override returns (uint256) {
        return _botList.length;
    }

    /// @inheritdoc IBotRegistry
    function getBotInfo(address bot)
        external
        view
        override
        returns (string memory reason, uint256 addedAt, bool licensed)
    {
        BotInfo storage info = _bots[bot];
        return (info.reason, info.addedAt, info.licensed);
    }

    /// @notice Get all registered bot addresses
    /// @return Array of bot addresses
    function getAllBots() external view returns (address[] memory) {
        return _botList;
    }

    /// @notice Batch add bots
    /// @param bots Array of bot addresses
    /// @param reasons Array of reasons
    function addBotsBatch(address[] calldata bots, string[] calldata reasons) external onlyOwner {
        require(bots.length == reasons.length, "Length mismatch");

        for (uint256 i = 0; i < bots.length; i++) {
            if (!_bots[bots[i]].isBot) {
                _bots[bots[i]] =
                    BotInfo({reason: reasons[i], addedAt: block.timestamp, isBot: true, licensed: false});

                _botIndex[bots[i]] = _botList.length;
                _botList.push(bots[i]);

                emit BotAdded(bots[i], reasons[i]);
            }
        }
    }

    /// @notice Update treasury address
    /// @param _treasury New treasury address
    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }

    /// @notice Withdraw any stuck funds
    function withdraw() external onlyOwner {
        (bool success,) = treasury.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }
}
