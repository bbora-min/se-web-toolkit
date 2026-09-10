import { z } from 'zod'

/**
 * 서비스 아이덴티티 — 서비스마다 다르게, 반드시 정하는 슬롯.
 * 브랜드 코어(타이포·간격·컴포넌트 형태)는 여기서 바꿀 수 없다.
 */
export const SIGNATURES = [
  'status-strip', // 헤더 아래 시스템 상태 스트립 (모니터링)
  'search-hero', // 커맨드 팔레트형 검색 히어로 (데이터 조회)
  'stage-rail', // 진행 단계 레일 (워크플로)
  'timeline-ribbon', // 시간축 리본 (이력·감사)
  'metric-marquee', // 핵심 지표 띠 (대시보드)
] as const

export const DISPLAY_FONTS = {
  pretendard: '"Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, sans-serif',
  'ibm-plex-sans': '"IBM Plex Sans", "Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, sans-serif',
  'noto-sans-kr': '"Noto Sans KR", "Pretendard Variable", Pretendard, system-ui, sans-serif',
  'ibm-plex-mono': '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const

export const identitySchema = z.object({
  /** 서비스 이름. 헤더의 "SE ▸ {name}" 로크업에 쓰인다 */
  name: z.string().min(1).max(40),
  /** 레지스트리 키 (kebab-case) */
  id: z.string().regex(/^[a-z][a-z0-9-]{1,39}$/),
  mark: z.discriminatedUnion('type', [
    z.object({ type: z.literal('monogram'), text: z.string().min(1).max(3) }),
    z.object({ type: z.literal('icon'), icon: z.string().min(1) }),
  ]),
  accent: z.object({
    /** 0–360. 채도·명도는 브랜드 밴드에서 자동 계산된다 */
    hue: z.number().min(0).max(360),
  }),
  /** 뉴트럴(회색)을 어느 쪽으로 2–3% 기울일지 */
  neutralBias: z.enum(['cool', 'warm', 'neutral', 'accent']).default('neutral'),
  signature: z.enum(SIGNATURES),
  density: z.enum(['compact', 'comfortable']).default('compact'),
  displayFont: z.enum(Object.keys(DISPLAY_FONTS) as [keyof typeof DISPLAY_FONTS, ...(keyof typeof DISPLAY_FONTS)[]]).default('pretendard'),
  chart: z.enum(['accent-sequential', 'categorical']).default('accent-sequential'),
  /** 마이크로카피·빈 상태 문구의 목소리 */
  tone: z.enum(['terse', 'friendly', 'procedural']).default('terse'),
})

export type IdentityInput = z.input<typeof identitySchema>
export type Identity = z.output<typeof identitySchema>

export function parseIdentity(raw: unknown): Identity {
  const result = identitySchema.safeParse(raw)
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
    throw new Error(`se.identity.json 형식이 올바르지 않습니다:\n${issues.join('\n')}`)
  }
  return result.data
}

/** 두 hue 사이의 최소 각도 (0–180) */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360
  return d > 180 ? 360 - d : d
}

/** 형제 서비스와 최소한 이만큼 떨어져야 "다른 제품"으로 읽힌다 */
export const MIN_HUE_DISTANCE = 30

/** @se/ui 가 실제로 구현한 시그니처. SIGNATURES 의 나머지는 예약. @se/ui 에 추가하면 여기도 올린다 */
export const IMPLEMENTED_SIGNATURES = ['status-strip', 'search-hero', 'stage-rail'] as const satisfies readonly (typeof SIGNATURES)[number][]

export interface RegistryEntry {
  id: string
  name: string
  hue: number
  signature: string
}
export interface RegistryIssue {
  level: 'error' | 'warn'
  a: string
  b: string
  message: string
}

/** 가족 규칙 — hue 30° 미만은 error, 같은 시그니처는 warn. check-identity 스크립트와 create-se-app 이 같이 쓴다 */
export function checkRegistry(services: RegistryEntry[]): RegistryIssue[] {
  const issues: RegistryIssue[] = []
  for (let i = 0; i < services.length; i++) {
    for (let j = i + 1; j < services.length; j++) {
      const a = services[i]!, b = services[j]!
      const d = hueDistance(a.hue, b.hue)
      if (d < MIN_HUE_DISTANCE) issues.push({ level: 'error', a: a.id, b: b.id, message: `${a.name}(${a.hue}°) ↔ ${b.name}(${b.hue}°): hue 거리 ${Math.round(d)}° < ${MIN_HUE_DISTANCE}° — 형제와 너무 닮음` })
      if (a.signature === b.signature) issues.push({ level: 'warn', a: a.id, b: b.id, message: `${a.name} ↔ ${b.name}: 같은 시그니처(${a.signature}) — 가능하면 다르게` })
    }
  }
  return issues
}
