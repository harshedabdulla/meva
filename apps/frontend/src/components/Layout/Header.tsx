import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, chains } = useSwitchChain()
  const [showChainMenu, setShowChainMenu] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentChain = chains.find(c => c.id === chainId)

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const availableConnectors = connectors.filter(c => c.name === 'Injected' || c.id === 'injected')
  const primaryConnector = availableConnectors[0] || connectors[0]

  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-0)]/80 backdrop-blur-xl border-b border-[var(--border-1)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="url(#logo-gradient)"/>
              <path d="M10 16L14 12L18 16L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 20L14 16L18 20L22 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#FF007A"/>
                  <stop offset="1" stopColor="#FF85C0"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-semibold">MEVA</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Chain selector */}
            {isConnected && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowChainMenu(!showChainMenu)
                    setShowWalletMenu(false)
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--green)]" />
                  <span className="hidden sm:inline">{currentChain?.name || 'Network'}</span>
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
                </button>
                {showChainMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowChainMenu(false)} />
                    <div className="absolute right-0 mt-2 w-48 card-elevated p-2 z-50">
                      {chains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => {
                            switchChain({ chainId: chain.id })
                            setShowChainMenu(false)
                          }}
                          className={`w-full px-3 py-2.5 text-left text-sm rounded-xl transition-colors flex items-center gap-2 ${
                            chain.id === chainId
                              ? 'bg-[var(--pink-500)]/10 text-[var(--pink-500)]'
                              : 'hover:bg-[var(--bg-2)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${chain.id === chainId ? 'bg-[var(--green)]' : 'bg-[var(--text-tertiary)]'}`} />
                          {chain.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Wallet button */}
            {isConnected ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowWalletMenu(!showWalletMenu)
                    setShowChainMenu(false)
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <span className="font-mono">{formatAddress(address!)}</span>
                </button>
                {showWalletMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowWalletMenu(false)} />
                    <div className="absolute right-0 mt-2 w-56 card-elevated overflow-hidden z-50">
                      <div className="p-4 border-b border-[var(--border-1)]">
                        <p className="text-xs text-[var(--text-tertiary)] mb-1">Connected</p>
                        <p className="font-mono text-sm">{formatAddress(address!)}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={copyAddress}
                          className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-[var(--bg-2)] transition-colors flex items-center gap-3 text-[var(--text-secondary)]"
                        >
                          {copied ? <Check className="w-4 h-4 text-[var(--green)]" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy address'}
                        </button>
                        <button
                          onClick={() => {
                            disconnect()
                            setShowWalletMenu(false)
                          }}
                          className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-[var(--bg-2)] transition-colors flex items-center gap-3 text-[var(--red)]"
                        >
                          <LogOut className="w-4 h-4" />
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: primaryConnector })}
                disabled={isPending}
                className="btn btn-primary btn-sm"
              >
                <Wallet className="w-4 h-4" />
                <span>{isPending ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
