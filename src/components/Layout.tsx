import { NavLink, Outlet } from 'react-router-dom'
import { useUniverse } from '../lib/store'

const tabs = [
  { to: '/', label: 'Universe' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/characters', label: 'Characters' },
  { to: '/sources', label: 'Sources' },
  { to: '/rumor-desk', label: 'Rumor Desk' },
  { to: '/explainer', label: 'Explainer' },
]

export function Layout() {
  const { state, reset } = useUniverse()

  return (
    <div className="starfield min-h-screen text-slate-200">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <NavLink to="/" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-bold tracking-tight text-white">LifeLens</span>
            <span className="hidden text-xs text-slate-400 sm:inline">the Musk universe, cited</span>
          </NavLink>
          <nav className="flex items-center gap-1 text-sm">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition ${
                    isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-100'
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <NavLink
              to="/ingest"
              className="rounded-full bg-accent-primary/90 px-4 py-1.5 text-sm font-semibold text-white shadow-neon transition hover:bg-accent-primary"
            >
              + Add source
            </NavLink>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <span>
            {state.events.length} events · {state.sources.length} sources · {state.accounts.length}{' '}
            accounts · every claim traceable
          </span>
          <button
            onClick={() => {
              if (confirm('Discard local additions and restore the seed dataset?')) reset()
            }}
            className="ml-auto rounded-full border border-white/10 px-3 py-1 text-slate-400 transition hover:border-white/25 hover:text-slate-200"
          >
            Reset to seed data
          </button>
        </div>
      </footer>
    </div>
  )
}
