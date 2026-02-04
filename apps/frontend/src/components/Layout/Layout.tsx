import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-glow">
      <Header />
      <main className="flex-1 relative z-10">
        {children}
      </main>
      <footer className="border-t border-[var(--border-1)] py-6 relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[var(--text-tertiary)]">
              MEVA Protocol
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">Docs</a>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">GitHub</a>
              <a href="#" className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
