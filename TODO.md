# meva - project status

## contracts (foundry)

- [x] project setup + dependencies (v4-core, v4-periphery, openzeppelin)
- [x] `BotRegistry.sol` - known bot addresses + licensing system
- [x] `MevaVault.sol` - dividend distribution (50% lp, 30% victims, 20% stakers)
- [x] `MevaHook.sol` - uniswap v4 hook with dynamic fee override
- [x] bot detection logic (gas, contract, registry, rapid-fire)
- [x] interfaces (`IBotRegistry`, `IMevaVault`)
- [x] unit tests (61 passing)
- [x] deployment script
- [ ] integration tests with actual v4 pool swaps
- [ ] gas optimization
- [ ] testnet deployment (sepolia/base)
- [ ] mainnet deployment

## frontend (react + vite)

- [ ] project setup (vite, tailwind, wagmi, viem)
- [ ] wallet connection
- [ ] dashboard layout
- [ ] `LiveFeed.tsx` - real-time mev captures
- [ ] `StatsCards.tsx` - total captured, distributed, apy
- [ ] `DividendChart.tsx` - historical dividends
- [ ] `ClaimPanel.tsx` - claim dividends/rebates
- [ ] `ChainSelector.tsx` - cross-chain claiming (li.fi)
- [ ] `UserStats.tsx` - personal earnings
- [ ] `ENSIdentity.tsx` - ens integration
- [ ] `RegisterBot.tsx` - bot licensing ui
- [ ] `BotLeaderboard.tsx` - top bots by tax paid
- [ ] mobile responsive

## backend (express + node)

- [ ] project setup (express, typescript)
- [ ] websocket server for live feed
- [ ] `/api/stats` - protocol statistics
- [ ] `/api/dividends/:address` - user dividend info
- [ ] `/api/bots` - bot registry data
- [ ] `yellowAggregator.ts` - state channel management (yellow network)
- [ ] `botDetector.ts` - off-chain bot detection ai
- [ ] `lifi.ts` - cross-chain claiming integration
- [ ] `ens.ts` - ens subdomain management
- [ ] database (postgres/redis for caching)
- [ ] indexer for on-chain events

## integrations

### yellow network (state channels)
- [ ] research yellow sdk
- [ ] implement tax aggregation off-chain
- [ ] batch settlement logic
- [ ] epoch management

### li.fi (cross-chain)
- [ ] li.fi sdk integration
- [ ] cross-chain claim routing
- [ ] supported chains config

### ens (identity)
- [ ] meva.eth subdomain setup
- [ ] user identity records
- [ ] bot licensing via ens

### arc/circle (usdc)
- [ ] arc deployment research
- [ ] usdc dividend token setup

## demo

- [ ] demo script (3 min)
- [ ] slide deck
- [ ] video recording
- [ ] live demo environment

## documentation

- [x] root readme
- [x] contracts readme
- [ ] api documentation
- [ ] architecture diagrams
- [ ] user guide

## devops

- [ ] ci/cd (github actions)
- [ ] contract verification (etherscan)
- [ ] monitoring (tenderly)
- [ ] error tracking (sentry)

---

## priority for hackathon

1. ~~contracts~~ ✓
2. frontend (dashboard + claim)
3. backend (basic api + websocket)
4. demo prep
5. integrations (yellow, li.fi if time)
