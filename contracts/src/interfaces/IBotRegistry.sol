// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IBotRegistry
/// @notice Interface for managing known MEV bots and their licensing status
interface IBotRegistry {
    /// @notice Emitted when a bot is added to the registry
    event BotAdded(address indexed bot, string reason);

    /// @notice Emitted when a bot is removed from the registry
    event BotRemoved(address indexed bot);

    /// @notice Emitted when a bot becomes licensed
    event BotLicensed(address indexed bot);

    /// @notice Emitted when a bot's license is revoked
    event BotLicenseRevoked(address indexed bot);

    /// @notice Check if an address is a known MEV bot
    /// @param bot The address to check
    /// @return True if the address is a known bot
    function isKnownBot(address bot) external view returns (bool);

    /// @notice Check if a bot has an active license (pays lower tax)
    /// @param bot The address to check
    /// @return True if the bot is licensed
    function isLicensed(address bot) external view returns (bool);

    /// @notice Add an address to the known bot registry
    /// @param bot The address to add
    /// @param reason Why this address is classified as a bot
    function addBot(address bot, string calldata reason) external;

    /// @notice Remove an address from the bot registry
    /// @param bot The address to remove
    function removeBot(address bot) external;

    /// @notice Register as a licensed bot (self-registration with fee)
    function registerAsLicensed() external payable;

    /// @notice Revoke a bot's license
    /// @param bot The bot address
    function revokeLicense(address bot) external;

    /// @notice Get the number of registered bots
    /// @return The total count of known bots
    function botCount() external view returns (uint256);

    /// @notice Get information about a bot
    /// @param bot The bot address
    /// @return reason The reason this address was flagged as a bot
    /// @return addedAt Timestamp when the bot was added
    /// @return licensed Whether the bot is currently licensed
    function getBotInfo(address bot)
        external
        view
        returns (string memory reason, uint256 addedAt, bool licensed);
}
