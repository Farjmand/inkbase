import { useEffect, useRef, useCallback } from 'react'
import type { Page } from '@/types'

export interface GraphNode {
  id: string
  title: string
  icon: string
  x: number
  y: number
  vx: number
  vy: number
}

export interface GraphEdge {
  source: string
  target: string
}

const REPULSION = 3000
const ATTRACTION = 0.04
const DAMPING = 0.85
const CENTER_PULL = 0.01
const MIN_DIST = 1

function initNodes(pages: Page[], width: number, height: number): GraphNode[] {
  return pages.map((p, i) => {
    const angle = (i / pages.length) * 2 * Math.PI
    const r = Math.min(width, height) * 0.3
    return {
      id: p.id,
      title: p.title,
      icon: p.icon,
      x: width / 2 + r * Math.cos(angle),
      y: height / 2 + r * Math.sin(angle),
      vx: 0,
      vy: 0,
    }
  })
}

function tick(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const cx = width / 2
  const cy = height / 2
  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  for (const n of nodes) {
    // Repulsion between all pairs
    for (const m of nodes) {
      if (n === m) continue
      const dx = n.x - m.x
      const dy = n.y - m.y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST)
      const force = REPULSION / (dist * dist)
      n.vx += (dx / dist) * force
      n.vy += (dy / dist) * force
    }
    // Center gravity
    n.vx += (cx - n.x) * CENTER_PULL
    n.vy += (cy - n.y) * CENTER_PULL
  }

  // Attraction along edges
  for (const e of edges) {
    const s = nodeMap.get(e.source)
    const t = nodeMap.get(e.target)
    if (!s || !t) continue
    const dx = t.x - s.x
    const dy = t.y - s.y
    s.vx += dx * ATTRACTION
    s.vy += dy * ATTRACTION
    t.vx -= dx * ATTRACTION
    t.vy -= dy * ATTRACTION
  }

  for (const n of nodes) {
    n.vx *= DAMPING
    n.vy *= DAMPING
    n.x += n.vx
    n.y += n.vy
    n.x = Math.max(24, Math.min(width - 24, n.x))
    n.y = Math.max(24, Math.min(height - 24, n.y))
  }
}

export function useForceGraph(
  pages: Page[],
  edges: GraphEdge[],
  width: number,
  height: number,
  onFrame: (nodes: GraphNode[]) => void
) {
  const nodesRef = useRef<GraphNode[]>([])
  const rafRef = useRef<number | null>(null)
  const stepsRef = useRef(0)
  const MAX_STEPS = 300

  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  useEffect(() => {
    if (width === 0 || height === 0) return
    nodesRef.current = initNodes(pages, width, height)
    stepsRef.current = 0
    stop()

    const loop = () => {
      tick(nodesRef.current, edges, width, height)
      onFrame([...nodesRef.current])
      stepsRef.current++
      if (stepsRef.current < MAX_STEPS) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }
    rafRef.current = requestAnimationFrame(loop)
    return stop
  // onFrame is stable ref via useCallback in parent; edges/pages identity matters
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages, edges, width, height, stop])
}
