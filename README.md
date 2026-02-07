<p align="center">
  <img src="docs/meva_logo.png" alt="meva" width="120" />
</p>

<h1 align="center">meva</h1>

<p align="center">
  <em>don't fight mev: own it.</em>
</p>

<p align="center">
  <a href="https://sepolia.etherscan.io/address/0x509E6EcDFcdE208aBC2fEc61DCD583E61953Db2f#code">
    <img src="https://img.shields.io/badge/botregistry-verified-brightgreen?logo=ethereum" alt="verified" />
  </a>
  <a href="https://sepolia.etherscan.io/address/0x3eb9675947365B89943bA008F217C7C505c460b4#code">
    <img src="https://img.shields.io/badge/mevavault-verified-brightgreen?logo=ethereum" alt="verified" />
  </a>
  <img src="https://img.shields.io/badge/tests-61%20passing-brightgreen" alt="tests" />
</p>

---

## the problem

mev bots extract **$1.4b+ annually** from defi users. sandwich attacks, frontrunning, arbitrage—regular traders lose while bots profit.

current solutions either block mev entirely (kills efficiency) or auction it to validators (users still lose).

## our take

tax the extraction. redistribute to victims.

```
user swaps → bot sandwiches → meva taxes 30% → dividends to lps + victims
```

bots still profit (less). lps earn extra yield. victims get rebates. everyone wins.

---

### tax rates

| who | rate | why |
|-----|------|-----|
| unlicensed bot | 50% | high extraction, no skin in game |
| licensed bot | 10% | paid 0.1 eth to register |
| suspicious | 25% | detected via heuristics |
| normal user | 0.3% | standard fee |

### detection

- registry lookup (known bots)
- contract check (tx.origin ≠ msg.sender)
- gas heuristics (high gas = likely bot)
- rapid-fire (multiple swaps/block)

---

## architecture

```
meva/
├── contracts/           # solidity (foundry)
│   ├── src/
│   │   ├── MevaHook.sol       # v4 hook
│   │   ├── MevaVault.sol      # dividend vault
│   │   └── BotRegistry.sol    # bot licensing
│   └── test/                  # 61 tests
│
├── apps/
│   ├── frontend/        # react + vite + tailwind v4
│   └── backend/         # express + websocket + indexer
│
└── packages/
    └── shared/          # types + abis
```

---

## uniswap - privacy defi: 

| requirement | how we do it |
|-------------|--------------|
| reduce extractive dynamics | tax mev, redistribute to victims |
| improve execution quality | users get rebates → less effective slippage |
| resilient to adverse selection | bot licensing = accountability |
| meaningful hook usage | mevahook is the core mechanism |

---

## deployed (sepolia)

| contract | address | status |
|----------|---------|--------|
| botregistry | [`0x509E...Db2f`](https://sepolia.etherscan.io/address/0x509E6EcDFcdE208aBC2fEc61DCD583E61953Db2f#code) | verified |
| mevavault | [`0x3eb9...60b4`](https://sepolia.etherscan.io/address/0x3eb9675947365B89943bA008F217C7C505c460b4#code) | verified |

**txs:**
- [`0x7249bcda...`](https://sepolia.etherscan.io/tx/0x7249bcda532ec7904f791136b19196791f46f8e18e31c951878a3ecd9d18e549) botregistry deploy
- [`0x9f3a717f...`](https://sepolia.etherscan.io/tx/0x9f3a717fa796101076c4d69fc9fc63bbb4292900720c74e9e396b1db0f8fbbf8) mevavault deploy

---

## quickstart

```bash
# contracts
cd contracts && forge install && forge test

# frontend
cd apps/frontend && npm i && npm run dev

# backend (demo mode)
cd apps/backend && npm i && npm run dev
```

---

## integrations

**uniswap** - privacy defi

**yellow network** : off-chain tax aggregation via nitrolite sdk. batch settlements for gas efficiency.

**li.fi** : cross-chain dividend claiming. claim on eth, arb, op, base, polygon.

---

## stack

| layer | tech |
|-------|------|
| contracts | solidity 0.8.26, foundry, uniswap v4 |
| frontend | react, vite, tailwind v4, wagmi, viem |
| backend | node, express, websocket |
| integrations | yellow network, li.fi |


## v2 roadmap

- integration tests with real v4 swaps
- gas optimization
- mainnet after audit
- governance token
- tiered licensing

---

mit license

---

<p align="center">
  <strong>meva: making mev work for everyone.</strong>
</p>
