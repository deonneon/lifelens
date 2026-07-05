import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Entity } from '../types'
import { useUniverse } from '../lib/store'
import { STATUS_META, eventsForEntity, statusOf } from '../lib/evidence'
import { StatusBadge } from '../components/badges'

interface NodePos {
  entity: Entity
  x: number
  y: number
  r: number
}

const W = 1000
const H = 680
const CX = W / 2
const CY = H / 2

export function UniversePage() {
  const { state } = useUniverse()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)

  const nodes = useMemo<NodePos[]>(() => {
    const center = state.entities.find((e) => e.id === 'elon-musk')
    const companies = state.entities.filter((e) => e.kind === 'company')
    const people = state.entities.filter((e) => e.kind === 'person' && e.id !== 'elon-musk')

    const out: NodePos[] = []
    const sizeFor = (e: Entity) =>
      Math.min(34, 13 + Math.sqrt(eventsForEntity(state, e.id).length) * 4.5)

    if (center) out.push({ entity: center, x: CX, y: CY, r: 40 })
    companies.forEach((e, i) => {
      const angle = (i / companies.length) * Math.PI * 2 - Math.PI / 2
      out.push({ entity: e, x: CX + Math.cos(angle) * 205, y: CY + Math.sin(angle) * 185, r: sizeFor(e) })
    })
    people.forEach((e, i) => {
      const angle = (i / people.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / people.length
      out.push({ entity: e, x: CX + Math.cos(angle) * 370, y: CY + Math.sin(angle) * 290, r: sizeFor(e) })
    })
    return out
  }, [state])

  const posById = useMemo(() => new Map(nodes.map((n) => [n.entity.id, n])), [nodes])

  const edges = useMemo(() => {
    const seen = new Set<string>()
    const out: { a: NodePos; b: NodePos; label: string }[] = []
    for (const e of state.entities) {
      for (const rel of e.relationships) {
        const key = [e.id, rel.targetId].sort().join('|')
        if (seen.has(key)) continue
        seen.add(key)
        const a = posById.get(e.id)
        const b = posById.get(rel.targetId)
        if (a && b) out.push({ a, b, label: rel.label })
      }
    }
    return out
  }, [state, posById])

  const hoveredNode = hovered ? posById.get(hovered) : null
  const statusCounts = useMemo(() => {
    const counts = { corroborated: 0, 'single-source': 0, disputed: 0, rumor: 0 }
    for (const ev of state.events) counts[statusOf(state, ev)] += 1
    return counts
  }, [state])

  return (
    <div>
      <div className="mb-6 max-w-3xl">
        <div className="eyebrow">Knowledge graph</div>
        <h1 className="page-title">The Universe</h1>
        <p className="lede">
          Every <em>character</em> — person or company — in the Musk story, connected by their
          relationships and sized by how much documented activity they have. Click a character to
          open their dossier; every event beneath it is traceable to cited accounts that can be
          disputed or clarified as new sources arrive.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(Object.keys(statusCounts) as (keyof typeof statusCounts)[]).map((s) => (
            <Link key={s} to={`/timeline?status=${s}`} className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 ring-1 ring-inset ring-edge transition hover:bg-surface-3">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {statusCounts[s]} {STATUS_META[s].label.toLowerCase()}
            </Link>
          ))}
          {state.pending.filter((p) => !p.dismissed).length > 0 && (
            <Link
              to="/characters#orbit-watch"
              className="flex items-center gap-1.5 rounded-full bg-status-warn/10 px-3 py-1 text-status-warn ring-1 ring-inset ring-status-warn/30 transition hover:bg-status-warn/15"
            >
              ◌ {state.pending.filter((p) => !p.dismissed).length} on orbit watch
            </Link>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-edge bg-canvas/60">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <defs>
            <radialGradient id="node-person" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#A79CF8" />
              <stop offset="55%" stopColor="#7C6CF0" />
              <stop offset="100%" stopColor="#4A3BB8" />
            </radialGradient>
            <radialGradient id="node-company" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="#7DD5FB" />
              <stop offset="55%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#1273A8" />
            </radialGradient>
            <filter id="node-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* orbit guides */}
          <ellipse cx={CX} cy={CY} rx={205} ry={185} fill="none" stroke="rgba(148,163,199,0.09)" strokeDasharray="2 6" />
          <ellipse cx={CX} cy={CY} rx={370} ry={290} fill="none" stroke="rgba(148,163,199,0.07)" strokeDasharray="2 6" />

          {edges.map((e, i) => {
            const active = hovered === e.a.entity.id || hovered === e.b.entity.id
            // gentle outward bow keeps crossings legible
            const mx = (e.a.x + e.b.x) / 2 + (CY - (e.a.y + e.b.y) / 2) * 0.12
            const my = (e.a.y + e.b.y) / 2 + ((e.a.x + e.b.x) / 2 - CX) * 0.12
            return (
              <path
                key={i}
                d={`M ${e.a.x} ${e.a.y} Q ${mx} ${my} ${e.b.x} ${e.b.y}`}
                fill="none"
                stroke={active ? 'rgba(148,138,246,0.85)' : 'rgba(148,163,199,0.13)'}
                strokeWidth={active ? 1.8 : 1}
              />
            )
          })}

          {nodes.map((n) => {
            const isPerson = n.entity.kind === 'person'
            const active = hovered === n.entity.id
            const isCenter = n.entity.id === 'elon-musk'
            const dim = hovered !== null && !active &&
              !edges.some((e) =>
                (e.a.entity.id === hovered && e.b.entity.id === n.entity.id) ||
                (e.b.entity.id === hovered && e.a.entity.id === n.entity.id),
              )
            const fill = isPerson ? 'url(#node-person)' : 'url(#node-company)'
            return (
              <g
                key={n.entity.id}
                className="cursor-pointer transition-opacity duration-200"
                opacity={dim ? 0.25 : 1}
                onMouseEnter={() => setHovered(n.entity.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/characters/${n.entity.id}`)}
              >
                {isCenter && (
                  <circle className="pulse-ring" cx={n.x} cy={n.y} r={n.r + 12} fill="none" stroke="#948AF6" strokeWidth={1.5} />
                )}
                {isPerson ? (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r={n.r}
                    fill={fill}
                    stroke={active ? '#fff' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={active ? 2 : 1}
                    filter={active || isCenter ? 'url(#node-glow)' : undefined}
                  />
                ) : (
                  <rect
                    x={n.x - n.r}
                    y={n.y - n.r}
                    width={n.r * 2}
                    height={n.r * 2}
                    rx={n.r * 0.32}
                    fill={fill}
                    stroke={active ? '#fff' : 'rgba(255,255,255,0.25)'}
                    strokeWidth={active ? 2 : 1}
                    filter={active ? 'url(#node-glow)' : undefined}
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + n.r + 17}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fill={active ? '#F4F5FA' : '#8F94A9'}
                  stroke="#0B0C12"
                  strokeWidth={3.5}
                  paintOrder="stroke"
                  fontSize={12.5}
                  fontWeight={600}
                  fontFamily="'Inter Variable', sans-serif"
                >
                  {n.entity.name}
                </text>
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fill="rgba(255,255,255,0.95)"
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="'JetBrains Mono Variable', monospace"
                >
                  {eventsForEntity(state, n.entity.id).length}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredNode && (
          <div className="pointer-events-none absolute left-4 top-4 w-72 rounded-xl border border-edge bg-surface-2/95 p-4 shadow-xl backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-ink-500">
              {hoveredNode.entity.kind === 'person' ? '● person' : '■ company'}
            </div>
            <div className="mt-0.5 font-display text-lg font-bold text-ink-50">{hoveredNode.entity.name}</div>
            {hoveredNode.entity.origin && (
              <div className="text-xs text-ink-400">{hoveredNode.entity.origin}</div>
            )}
            <div className="mt-2 text-xs text-ink-300">
              {eventsForEntity(state, hoveredNode.entity.id).length} documented events
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-ink-400">
              {hoveredNode.entity.relationships.slice(0, 5).map((r) => {
                const target = state.entities.find((e) => e.id === r.targetId)
                return target ? (
                  <li key={r.targetId}>
                    <span className="text-ink-100">{target.name}</span> — {r.label}
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex gap-4 rounded-full bg-surface-2/80 px-4 py-1.5 text-[11px] text-ink-400 ring-1 ring-inset ring-edge">
          <span><span className="text-accent-bright">●</span> person</span>
          <span><span className="text-status-info">■</span> company</span>
          <span>number = documented events</span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.events
          .filter((e) => statusOf(state, e) === 'disputed')
          .map((e) => (
            <Link
              key={e.id}
              to={`/events/${e.id}`}
              className="rounded-xl border border-status-bad/25 bg-status-bad/[0.05] p-4 transition hover:border-status-bad/45"
            >
              <StatusBadge status="disputed" />
              <div className="mt-2 font-display text-sm font-semibold text-ink-100">{e.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-ink-400">{e.summary}</div>
            </Link>
          ))}
      </div>
    </div>
  )
}
