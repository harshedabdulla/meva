# meva

> don't fight mev—own it.

mev capture and redistribution protocol. tax bots, reward users.

```
user trades → bot sandwiches → meva taxes 30% → dividends to lps + victims
```

## architecture

```
meva/
├── contracts/          # solidity (foundry)
│   ├── src/
│   │   ├── MevaHook.sol       # uniswap v4 hook
│   │   ├── MevaVault.sol      # dividend vault
│   │   └── BotRegistry.sol    # bot detection
│   └── test/
├── apps/
│   ├── frontend/       # react dashboard
│   └── backend/        # api + aggregator
└── packages/
    └── shared/         # types + abis
```

## how it works

| step | action |
|------|--------|
| 1 | v4 hook detects bot (gas, contract, registry) |
| 2 | dynamic fee applied (10-50% based on confidence) |
| 3 | tax flows to vault |
| 4 | distribution: 50% lp, 30% victims, 20% stakers |

## tax rates

```
unlicensed bot  →  50%
licensed bot    →  10%  (0.1 eth registration)
suspicious      →  25%
normal user     →  0.3%
```

## quick start

```bash
# contracts
cd contracts
forge install
forge build
forge test
```

## stack

- **contracts**: solidity, foundry, uniswap v4
- **frontend**: react, viem, wagmi
- **backend**: node, express

## prize tracks

ethglobal hackmoney 2026: yellow, uniswap v4, arc/circle, li.fi, ens

## license

mit
