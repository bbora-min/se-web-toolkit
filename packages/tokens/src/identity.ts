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

/**
 * 쉘 배치 — 서비스가 고르는 골격의 첫 결정. 화면 골격(목록·보드·대시보드·문서 …)은 화면마다 고르지만 쉘은 서비스에 하나.
 *  sidebar : 좌측 네비 + 상단 검색. 목록·대시보드 중심 도구 (기본)
 *  topnav  : 상단 한 줄 네비, 사이드바 없음. 허브·콘솔처럼 화면이 넓어야 하는 도구
 *  panes   : 좌측 아이콘 레일 + 전폭 콘텐츠. 처리함·로그처럼 화면 안에서 패널을 나누는 도구
 */
export const SHELLS = ['sidebar', 'topnav', 'panes'] as const
export type Shell = (typeof SHELLS)[number]
/** shell 을 안 적은 아이덴티티·레지스트리 행의 배치 */
export const DEFAULT_SHELL: Shell = 'sidebar'

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
  /** 쉘 배치. 형제와 같은 배치가 셋 이상이면 레지스트리 검사가 경고한다 */
  shell: z.enum(SHELLS).default(DEFAULT_SHELL),
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

/** 레지스트리 행의 마크 글자 — monogram 이 없으면 이름의 영문 이니셜 2자, 그것도 없으면 SE */
export function registryMonogram(s: { name: string; monogram?: string }): string {
  return s.monogram ?? (s.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() || 'SE')
}

/** @se/ui 가 실제로 구현한 시그니처 — 지금은 SIGNATURES 전부. 새 시그니처를 스키마에 먼저 예약하고 @se/ui 에 구현한 뒤 여기 올리는 순서를 위해 따로 둔다 */
export const IMPLEMENTED_SIGNATURES = ['status-strip', 'search-hero', 'stage-rail', 'timeline-ribbon', 'metric-marquee'] as const satisfies readonly (typeof SIGNATURES)[number][]

export interface RegistryEntry {
  id: string
  name: string
  hue: number
  signature: string
  /** 없으면 sidebar */
  shell?: string
  /** 마크 글자(1–3자). 없으면 이름의 영문 이니셜 */
  monogram?: string
  neutralBias?: string
}
export interface RegistryIssue {
  level: 'error' | 'warn'
  /** 쌍 규칙(hue·시그니처)의 두 서비스. 묶음 규칙(쉘 배치)은 첫·마지막 */
  a: string
  b: string
  /** 묶음 규칙이면 관련 서비스 전부 — 호출자는 `ids?.includes(id) ?? (a === id || b === id)` 로 거른다 */
  ids?: string[]
  message: string
}

/** 같은 쉘 배치를 이만큼 이상 쓰면 "색만 다른 형제" — 경고 */
export const MAX_SAME_SHELL = 2

/** 가족 규칙 — hue 30° 미만은 error, 같은 시그니처는 warn, 같은 쉘 배치 셋 이상은 warn. check-identity 스크립트와 create-se-app 이 같이 쓴다 */
export function checkRegistry(services: RegistryEntry[]): RegistryIssue[] {
  const issues: RegistryIssue[] = []
  for (const shell of SHELLS) {
    const group = services.filter((s) => (s.shell ?? DEFAULT_SHELL) === shell)
    if (group.length > MAX_SAME_SHELL) {
      issues.push({
        level: 'warn',
        a: group[0]!.id,
        b: group[group.length - 1]!.id,
        ids: group.map((g) => g.id),
        message: `${group.map((g) => g.name).join(' · ')}: 쉘 배치가 전부 ${shell} — 색만 다른 형제가 된다. 새 서비스는 다른 배치(${SHELLS.filter((x) => x !== shell).join(' | ')})를 고려`,
      })
    }
  }
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
