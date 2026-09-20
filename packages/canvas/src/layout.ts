/**
 * DAG 자동 배치 — dagre 없이. 노드를 "가장 긴 상류 경로" 기준으로 층(level)에 놓고, 층 안에서는 입력 순서대로 세로로.
 * 파이프라인·의존 그래프처럼 노드가 수십 개인 내부 도구엔 이것으로 충분하다. 수백 개면 dagre·elk 를 붙인다.
 */
export interface LayoutNode {
  id: string
}
export interface LayoutEdge {
  from: string
  to: string
}
export interface Placed {
  id: string
  x: number
  y: number
  level: number
}

export function dagLayout<N extends LayoutNode>(nodes: N[], edges: LayoutEdge[], opts: { gapX?: number; gapY?: number; direction?: 'LR' | 'TB' } = {}): Placed[] {
  const { gapX = 260, gapY = 92, direction = 'LR' } = opts
  const ids = nodes.map((n) => n.id)
  const idSet = new Set(ids)
  const inbound = new Map<string, string[]>(ids.map((id) => [id, []]))
  for (const e of edges) if (inbound.has(e.to) && idSet.has(e.from)) inbound.get(e.to)!.push(e.from)
  const level = new Map<string, number>()
  const visiting = new Set<string>()
  const depth = (id: string): number => {
    if (level.has(id)) return level.get(id)!
    if (visiting.has(id)) return 0 // 순환 — 그래프가 잘못됐지만 그리기는 한다
    visiting.add(id)
    const up = inbound.get(id) ?? []
    const d = up.length ? Math.max(...up.map(depth)) + 1 : 0
    visiting.delete(id)
    level.set(id, d)
    return d
  }
  for (const id of ids) depth(id)
  const byLevel = new Map<number, string[]>()
  for (const id of ids) {
    const l = level.get(id) ?? 0
    byLevel.set(l, [...(byLevel.get(l) ?? []), id])
  }
  const tallest = Math.max(...[...byLevel.values()].map((v) => v.length))
  const out: Placed[] = []
  for (const [l, list] of byLevel) {
    const offset = ((tallest - list.length) * gapY) / 2 // 층을 세로 가운데로
    list.forEach((id, i) => {
      const a = l * gapX
      const b = offset + i * gapY
      out.push(direction === 'LR' ? { id, x: a, y: b, level: l } : { id, x: b, y: a, level: l })
    })
  }
  return out
}
