import { NavLink, Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useUniverse } from '../lib/store'

function Icon({ d, extra }: { d: string; extra?: ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="h-[17px] w-[17px] shrink-0">
      <path d={d} />
      {extra}
    </svg>
  )
}

const NAV = [
  {
    to: '/',
    label: 'Universe',
    icon: <Icon d="M10 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" extra={<path d="M3.2 12.6c-1.5-3.4 6.2-9.3 9.6-8.4M16.8 7.4c1.5 3.4-6.2 9.3-9.6 8.4" />} />,
  },
  {
    to: '/timeline',
    label: 'Timeline',
    icon: <Icon d="M4 3.5v13" extra={<><circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none" /><path d="M8 6h8M8 10.5h6M8 15h8" /><circle cx="4" cy="10.5" r="1.4" fill="currentColor" stroke="none" /><circle cx="4" cy="15" r="1.4" fill="currentColor" stroke="none" /></>} />,
  },
  {
    to: '/characters',
    label: 'Characters',
    icon: <Icon d="M7.5 9a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 7.5 9Z" extra={<path d="M2.5 16.5c.4-3 2.4-4.5 5-4.5s4.6 1.5 5 4.5M13.5 8.8a2.4 2.4 0 1 0-1.2-4.5M14.6 12.3c1.8.4 2.7 1.7 2.9 3.7" />} />,
  },
  {
    to: '/sources',
    label: 'Sources',
    icon: <Icon d="M4 3.5h8.5a2 2 0 0 1 2 2v11H6a2 2 0 0 1-2-2v-11Z" extra={<path d="M14.5 13.5H6a2 2 0 0 0-2 2M7 7h5M7 10h4" />} />,
  },
  {
    to: '/rumor-desk',
    label: 'Rumor Desk',
    icon: <Icon d="M10 10 15 5" extra={<><path d="M10 17a7 7 0 1 1 7-7" /><circle cx="10" cy="10" r="1.3" fill="currentColor" stroke="none" /><path d="M10 13.5A3.5 3.5 0 1 1 13.5 10" /></>} />,
  },
  {
    to: '/explainer',
    label: 'Explainer',
    icon: <Icon d="M4 16.5 5 13 13.8 4.2a1.7 1.7 0 0 1 2.4 0l.1.1a1.7 1.7 0 0 1 0 2.4L7.5 15.5 4 16.5Z" extra={<path d="M12.5 5.5l2.5 2.5" />} />,
  },
]

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
              isActive
                ? 'bg-surface-2 text-ink-50 shadow-card'
                : 'text-ink-500 hover:bg-surface-1 hover:text-ink-100'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <span className={isActive ? 'text-accent-bright' : 'text-ink-600 transition group-hover:text-ink-400'}>
                {item.icon}
              </span>
              {item.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-bright" />}
            </>
          )}
        </NavLink>
      ))}
    </>
  )
}

export function Layout() {
  const { state, reset } = useUniverse()

  return (
    <div className="app-bg min-h-screen text-ink-300">
      {/* ── desktop sidebar ─────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-edge bg-canvas/70 px-3.5 pb-4 pt-6 backdrop-blur-xl lg:flex">
        <NavLink to="/" className="px-3">
          <div className="font-display text-[22px] font-semibold tracking-tight text-ink-50">
            LifeLens
          </div>
          <div className="mt-0.5 text-[11px] leading-snug text-ink-500">
            the Musk universe, cited
          </div>
        </NavLink>

        <nav className="mt-7 flex flex-col gap-1">
          <NavItems />
        </nav>

        <NavLink to="/ingest" className="btn-primary mt-6 w-full">
          <span className="text-base leading-none">+</span> Add source
        </NavLink>

        <div className="mt-auto space-y-3 px-3 pt-6">
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              [state.events.length, 'events'],
              [state.sources.length, 'sources'],
              [state.accounts.length, 'accounts'],
            ].map(([n, label]) => (
              <div key={label} className="rounded-lg bg-surface-1 py-1.5">
                <div className="font-mono text-sm font-semibold text-ink-100">{n}</div>
                <div className="text-[10px] text-ink-600">{label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              if (confirm('Discard local additions and restore the seed dataset?')) reset()
            }}
            className="w-full text-left text-[11px] text-ink-600 transition hover:text-ink-400"
          >
            ↺ Reset to seed data
          </button>
        </div>
      </aside>

      {/* ── mobile top bar ──────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-edge bg-canvas/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <NavLink to="/" className="font-display text-lg font-semibold text-ink-50">
            LifeLens
          </NavLink>
          <NavLink to="/ingest" className="btn-primary ml-auto !px-3.5 !py-1.5">
            + Add source
          </NavLink>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2.5">
          <NavItems />
        </nav>
      </header>

      <main className="lg:pl-60">
        <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
