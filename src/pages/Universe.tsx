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
        <h1 className="font-serif text-3xl font-bold text-white">The Universe</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Every <em>character</em> — person or company — in the Musk story, connected by their
          relationships and sized by how much documented activity they have. Click a character to
          open their dossier; every event beneath it is traceable to cited accounts that can be
          disputed or clarified as new sources arrive.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {(Object.keys(statusCounts) as (keyof typeof statusCounts)[]).map((s) => (
            <Link key={s} to={`/timeline?status=${s}`} className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 ring-1 ring-inset ring-white/10 transition hover:bg-white/10">
              <span className={`h-2 w-2 rounded-full ${STATUS_META[s].dot}`} />
              {statusCounts[s]} {STATUS_META[s].label.toLowerCase()}
            </Link>
          ))}
          {state.pending.filter((p) => !p.dismissed).length > 0 && (
            <Link
              to="/characters#orbit-watch"
              className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-300 ring-1 ring-inset ring-amber-400/30 transition hover:bg-amber-500/20"
            >
              ◌ {state.pending.filter((p) => !p.dismissed).length} on orbit watch
            </Link>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* orbit guides */}
          <ellipse cx={CX} cy={CY} rx={205} ry={185} fill="none" stroke="rgba(255,255,255,0.05)" />
          <ellipse cx={CX} cy={CY} rx={370} ry={290} fill="none" stroke="rgba(255,255,255,0.04)" />

          {edges.map((e, i) => {
            const active = hovered === e.a.entity.id || hovered === e.b.entity.id
            return (
              <line
                key={i}
                x1={e.a.x}
                y1={e.a.y}
                x2={e.b.x}
                y2={e.b.y}
                stroke={active ? 'rgba(139,92,246,0.7)' : 'rgba(148,163,184,0.14)'}
                strokeWidth={active ? 1.8 : 1}
              />
            )
          })}

          {nodes.map((n) => {
            const isPerson = n.entity.kind === 'person'
            const active = hovered === n.entity.id
            const dim = hovered !== null && !active &&
              !edges.some((e) =>
                (e.a.entity.id === hovered && e.b.entity.id === n.entity.id) ||
                (e.b.entity.id === hovered && e.a.entity.id === n.entity.id),
              )
            const fill = isPerson ? 'rgba(139,92,246,0.85)' : 'rgba(59,130,246,0.8)'
            return (
              <g
                key={n.entity.id}
                className="cursor-pointer"
                opacity={dim ? 0.3 : 1}
                onMouseEnter={() => setHovered(n.entity.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => navigate(`/characters/${n.entity.id}`)}
              >
                {isPerson ? (
                  <circle cx={n.x} cy={n.y} r={n.r} fill={fill} stroke="rgba(255,255,255,0.35)" strokeWidth={active ? 2.5 : 1} />
                ) : (
                  <rect
                    x={n.x - n.r}
                    y={n.y - n.r}
                    width={n.r * 2}
                    height={n.r * 2}
                    rx={8}
                    fill={fill}
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth={active ? 2.5 : 1}
                  />
                )}
                <text
                  x={n.x}
                  y={n.y + n.r + 16}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fill={active ? '#fff' : '#94a3b8'}
                  fontSize={13}
                  fontWeight={600}
                >
                  {n.entity.name}
                </text>
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fill="rgba(255,255,255,0.9)"
                  fontSize={11}
                  fontWeight={700}
                >
                  {eventsForEntity(state, n.entity.id).length}
                </text>
              </g>
            )
          })}
        </svg>

        {hoveredNode && (
          <div className="pointer-events-none absolute left-4 top-4 w-72 rounded-xl border border-white/15 bg-slate-900/95 p-4 shadow-xl backdrop-blur">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {hoveredNode.entity.kind === 'person' ? '● person' : '■ company'}
            </div>
            <div className="mt-0.5 font-serif text-lg font-bold text-white">{hoveredNode.entity.name}</div>
            {hoveredNode.entity.origin && (
              <div className="text-xs text-slate-400">{hoveredNode.entity.origin}</div>
            )}
            <div className="mt-2 text-xs text-slate-300">
              {eventsForEntity(state, hoveredNode.entity.id).length} documented events
            </div>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
              {hoveredNode.entity.relationships.slice(0, 5).map((r) => {
                const target = state.entities.find((e) => e.id === r.targetId)
                return target ? (
                  <li key={r.targetId}>
                    <span className="text-slate-200">{target.name}</span> — {r.label}
                  </li>
                ) : null
              })}
            </ul>
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex gap-4 rounded-full bg-slate-900/80 px-4 py-1.5 text-[11px] text-slate-400 ring-1 ring-inset ring-white/10">
          <span><span className="text-violet-300">●</span> person</span>
          <span><span className="text-sky-300">■</span> company</span>
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
              className="rounded-xl border border-rose-400/20 bg-rose-500/[0.04] p-4 transition hover:border-rose-400/40"
            >
              <StatusBadge status="disputed" />
              <div className="mt-2 font-serif text-sm font-semibold text-slate-100">{e.title}</div>
              <div className="mt-1 line-clamp-2 text-xs text-slate-400">{e.summary}</div>
            </Link>
          ))}
      </div>
    </div>
  )
}
