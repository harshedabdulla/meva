import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from 'wagmi'
import { Wallet, ChevronDown, LogOut, Copy, Check, Book, LayoutDashboard, Trophy, Zap, Menu, X, ArrowRightLeft } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  currentPage: 'dashboard' | 'docs' | 'leaderboard' | 'auto-settle' | 'cross-chain'
  onNavigate: (page: 'dashboard' | 'docs' | 'leaderboard' | 'auto-settle' | 'cross-chain') => void
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const { switchChain, chains } = useSwitchChain()
  const [showChainMenu, setShowChainMenu] = useState(false)
  const [showWalletMenu, setShowWalletMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
          {/* Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 -ml-2 rounded-xl hover:bg-[var(--bg-2)] transition-colors"
              aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
              aria-expanded={showMobileMenu}
            >
              {showMobileMenu ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2" aria-label="MEVA home">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
              <span className="text-xl font-semibold hidden sm:inline">MEVA</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex items-center gap-1" aria-label="Main navigation">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentPage === 'leaderboard'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Leaderboard
              </button>
              <button
                onClick={() => onNavigate('docs')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentPage === 'docs'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Book className="w-4 h-4" />
                Docs
              </button>
              <button
                onClick={() => onNavigate('cross-chain')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentPage === 'cross-chain'
                    ? 'bg-[rgba(76,130,251,0.15)] text-[var(--blue)]'
                    : 'text-[var(--blue)]/70 hover:text-[var(--blue)] hover:bg-[rgba(76,130,251,0.1)]'
                }`}
              >
                <ArrowRightLeft className="w-4 h-4" />
                Bridge
              </button>
              <button
                onClick={() => onNavigate('auto-settle')}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  currentPage === 'auto-settle'
                    ? 'bg-[rgba(255,199,0,0.15)] text-[#FFC700]'
                    : 'text-[#FFC700]/70 hover:text-[#FFC700] hover:bg-[rgba(255,199,0,0.1)]'
                }`}
              >
                <Zap className="w-4 h-4" />
                Auto-Settle
              </button>
            </nav>
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
                  aria-expanded={showChainMenu}
                  aria-haspopup="listbox"
                  aria-label={`Current network: ${currentChain?.name || 'Unknown'}. Click to change network`}
                >
                  <div className="w-2 h-2 rounded-full bg-[var(--green)]" aria-hidden="true" />
                  <span className="hidden sm:inline">{currentChain?.name || 'Network'}</span>
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" aria-hidden="true" />
                </button>
                {showChainMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowChainMenu(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-48 card-elevated p-2 z-50" role="listbox" aria-label="Select network">
                      {chains.map((chain) => (
                        <button
                          key={chain.id}
                          onClick={() => {
                            switchChain({ chainId: chain.id })
                            setShowChainMenu(false)
                          }}
                          role="option"
                          aria-selected={chain.id === chainId}
                          className={`w-full px-3 py-2.5 text-left text-sm rounded-xl transition-colors flex items-center gap-2 ${
                            chain.id === chainId
                              ? 'bg-[var(--pink-500)]/10 text-[var(--pink-500)]'
                              : 'hover:bg-[var(--bg-2)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${chain.id === chainId ? 'bg-[var(--green)]' : 'bg-[var(--text-tertiary)]'}`} aria-hidden="true" />
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
                  aria-expanded={showWalletMenu}
                  aria-haspopup="menu"
                  aria-label={`Wallet ${formatAddress(address!)}. Click for options`}
                >
                  <span className="font-mono">{formatAddress(address!)}</span>
                </button>
                {showWalletMenu && (
                  <>
                    <div className="fixed inset-0" onClick={() => setShowWalletMenu(false)} aria-hidden="true" />
                    <div className="absolute right-0 mt-2 w-56 card-elevated overflow-hidden z-50" role="menu" aria-label="Wallet options">
                      <div className="p-4 border-b border-[var(--border-1)]">
                        <p className="text-xs text-[var(--text-tertiary)] mb-1">Connected</p>
                        <p className="font-mono text-sm">{formatAddress(address!)}</p>
                      </div>
                      <div className="p-2">
                        <button
                          onClick={copyAddress}
                          role="menuitem"
                          className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-[var(--bg-2)] transition-colors flex items-center gap-3 text-[var(--text-secondary)]"
                        >
                          {copied ? <Check className="w-4 h-4 text-[var(--green)]" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                          {copied ? 'Copied!' : 'Copy address'}
                        </button>
                        <button
                          onClick={() => {
                            disconnect()
                            setShowWalletMenu(false)
                          }}
                          role="menuitem"
                          className="w-full px-3 py-2.5 text-left text-sm rounded-xl hover:bg-[var(--bg-2)] transition-colors flex items-center gap-3 text-[var(--red)]"
                        >
                          <LogOut className="w-4 h-4" aria-hidden="true" />
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
                aria-label={isPending ? 'Connecting wallet' : 'Connect wallet'}
              >
                <Wallet className="w-4 h-4" aria-hidden="true" />
                <span>{isPending ? 'Connecting...' : 'Connect'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 sm:hidden"
            onClick={() => setShowMobileMenu(false)}
            aria-hidden="true"
          />
          <nav
            className="fixed top-[73px] left-0 right-0 bg-[var(--bg-1)] border-b border-[var(--border-1)] z-40 sm:hidden"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="p-4 space-y-1">
              <button
                onClick={() => {
                  onNavigate('dashboard')
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === 'dashboard'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" aria-hidden="true" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  onNavigate('leaderboard')
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === 'leaderboard'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Trophy className="w-5 h-5" aria-hidden="true" />
                Leaderboard
              </button>
              <button
                onClick={() => {
                  onNavigate('docs')
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === 'docs'
                    ? 'bg-[var(--bg-2)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-2)]'
                }`}
              >
                <Book className="w-5 h-5" aria-hidden="true" />
                Docs
              </button>
              <button
                onClick={() => {
                  onNavigate('cross-chain')
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === 'cross-chain'
                    ? 'bg-[rgba(76,130,251,0.15)] text-[var(--blue)]'
                    : 'text-[var(--blue)]/70 hover:bg-[rgba(76,130,251,0.1)]'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5" aria-hidden="true" />
                Bridge
              </button>
              <button
                onClick={() => {
                  onNavigate('auto-settle')
                  setShowMobileMenu(false)
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  currentPage === 'auto-settle'
                    ? 'bg-[rgba(255,199,0,0.15)] text-[#FFC700]'
                    : 'text-[#FFC700]/70 hover:bg-[rgba(255,199,0,0.1)]'
                }`}
              >
                <Zap className="w-5 h-5" aria-hidden="true" />
                Auto-Settle
              </button>
            </div>
          </nav>
        </>
      )}
    </header>
  )
}
