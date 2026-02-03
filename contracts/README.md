# meva protocol

> mev capture and redistribution via uniswap v4 hooks

## architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  mevahook   │────▶│  mevavault  │────▶│  dividends  │
│  (v4 hook)  │     │  (treasury) │     │  lp/victim  │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│ botregistry │
│ (detection) │
└─────────────┘
```

## contracts

| contract | description |
|----------|-------------|
| `mevahook.sol` | v4 hook w/ dynamic fee override based on bot detection |
| `mevavault.sol` | dividend distribution (50% lp, 30% victims, 20% stakers) |
| `botregistry.sol` | known bot registry + self-licensing (0.1 eth) |

## bot detection

```
score >= 60 → bot
────────────────────────────
known registry     +100 (instant)
high gas (3x avg)  +35
contract caller    +25
large swap (>10k)  +15
rapid-fire (same block) +20
```

## tax rates

| classification | fee |
|---------------|-----|
| unlicensed bot | 50% |
| licensed bot | 10% |
| suspicious | 25% |
| normal | 0.3% |

## build

```bash
forge install
forge build
forge test
```

## deploy

```bash
POOL_MANAGER=0x... USDC=0x... forge script script/Deploy.s.sol --broadcast
```

## license

mit
