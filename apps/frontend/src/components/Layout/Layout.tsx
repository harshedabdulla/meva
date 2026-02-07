import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
  currentPage: 'landing' | 'dashboard' | 'docs' | 'leaderboard' | 'auto-settle' | 'cross-chain'
  onNavigate: (page: 'landing' | 'dashboard' | 'docs' | 'leaderboard' | 'auto-settle' | 'cross-chain') => void
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-glow">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      <main id="main-content" className="flex-1 relative z-10" role="main">
        {children}
      </main>
      <footer className="border-t border-[var(--border-1)] py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-tertiary)]">
              MEVA Protocol
            </p>
            <div className="flex items-center gap-6">
              <button
                onClick={() => onNavigate('docs')}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Docs
              </button>
              <a
                href="https://github.com/your-org/meva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://discord.gg/meva"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
