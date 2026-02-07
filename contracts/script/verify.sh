#!/bin/bash

# MEVA Protocol - Contract Verification Script for Sepolia
# Run from contracts/ directory: ./script/verify.sh

set -e

# Load environment
source .env

# Contract addresses (Sepolia deployment)
BOT_REGISTRY="0x509E6EcDFcdE208aBC2fEc61DCD583E61953Db2f"
MEVA_VAULT="0x3eb9675947365B89943bA008F217C7C505c460b4"

# Constructor arguments
TREASURY="0x092dA3C40d8c06b4855A0fa38907B290494099B2"
SEPOLIA_USDC="0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"

echo "=== MEVA Contract Verification ==="
echo ""

# Verify BotRegistry
echo "Verifying BotRegistry..."
forge verify-contract \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" $TREASURY) \
  $BOT_REGISTRY \
  src/BotRegistry.sol:BotRegistry \
  --watch

echo ""

# Verify MevaVault
echo "Verifying MevaVault..."
forge verify-contract \
  --chain-id 11155111 \
  --etherscan-api-key $ETHERSCAN_API_KEY \
  --constructor-args $(cast abi-encode "constructor(address)" $SEPOLIA_USDC) \
  $MEVA_VAULT \
  src/MevaVault.sol:MevaVault \
  --watch

echo ""
echo "=== Verification Complete ==="
echo ""
echo "View contracts on Etherscan:"
echo "  BotRegistry: https://sepolia.etherscan.io/address/$BOT_REGISTRY#code"
echo "  MevaVault:   https://sepolia.etherscan.io/address/$MEVA_VAULT#code"
