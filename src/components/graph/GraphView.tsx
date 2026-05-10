import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useVaultStore } from '@/store/vaultStore'
import { useKnowledgeStore } from '@/store/knowledgeStore'
import { extractWikilinks, resolveLink } from '@/lib/links'
import { useForceGraph, type GraphNode, type GraphEdge } from './useForceGraph'

const WIDTH = 800
const HEIGHT = 600
const NODE_R = 18

export function GraphView() {
  const graphOpen = useKnowledgeStore(s => s.graphOpen)
  const closeGraph = useKnowledgeStore(s => s.closeGraph)
  const flatPages = useVaultStore(s => s.flatPages)
  const setActivePage = useVaultStore(s => s.setActivePage)

  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [hovered, setHovered] = useState<string | null>(null)

  const edges = useMemo<GraphEdge[]>(() => {
    const result: GraphEdge[] = []
    for (const page of flatPages) {
      for (const title of extractWikilinks(page.content)) {
        const target = resolveLink(title, flatPages)
        if (target && target.id !== page.id) {
          result.push({ source: page.id, target: target.id })
        }
      }
    }
    return result
  }, [flatPages])

  const onFrame = useCallback((updated: GraphNode[]) => setNodes(updated), [])

  useForceGraph(flatPages, edges, graphOpen ? WIDTH : 0, graphOpen ? HEIGHT : 0, onFrame)

  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!graphOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeGraph() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [graphOpen, closeGraph])

  if (!graphOpen) return null

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={closeGraph}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            Graph View — {flatPages.length} pages, {edges.length} links
          </span>
          <button
            className="text-sm opacity-50 hover:opacity-100"
            style={{ color: 'var(--color-text)' }}
            onClick={closeGraph}
          >
            ✕
          </button>
        </div>

        <svg
          ref={svgRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ display: 'block' }}
        >
          {/* Edges */}
          {edges.map((e, i) => {
            const s = nodeMap.get(e.source)
            const t = nodeMap.get(e.target)
            if (!s || !t) return null
            return (
              <line
                key={i}
                x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                stroke="var(--color-border)"
                strokeWidth={1.5}
                strokeOpacity={0.6}
              />
            )
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isHovered = hovered === node.id
            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => { setActivePage(node.id); closeGraph() }}
              >
                <circle
                  r={NODE_R}
                  fill={isHovered ? 'var(--color-accent, #6366f1)' : 'var(--color-hover)'}
                  stroke={isHovered ? 'var(--color-accent, #6366f1)' : 'var(--color-border)'}
                  strokeWidth={2}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={14}
                >
                  {node.icon}
                </text>
                {isHovered && (
                  <text
                    y={NODE_R + 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--color-text)"
                  >
                    {node.title.length > 20 ? node.title.slice(0, 18) + '…' : node.title}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
