import type { AppId } from './links'
import shotJobs from '../../../../examples/reference-app/e2e/__snapshots__/overview-light-1280.png'
import shotDatasets from '../../../../examples/dataset-explorer/e2e/__snapshots__/datasets-light-1280.png'
import shotReleases from '../../../../examples/release-desk/e2e/__snapshots__/releases-light-1280.png'
import shotHome from '../../../../examples/se-home/e2e/__snapshots__/home-light-1280.png'

export interface ExampleApp {
  id: AppId
  name: string
  monogram: string
  hue: number
  /** 무엇을 흉내 내는 도구인가 */
  tagline: string
  /** 아이덴티티 요약 — 같은 툴킷에서 어떻게 다른 모습이 나오는지 */
  identity: string
  /** 이 앱이 원본을 맡은 골격 */
  archetypes: string[]
  shot: string
  dir: string
}

/** 예제 앱 4개 — 가상의 사내 도구. 각자 화면 골격 몇 가지의 원본을 맡는다. 그림은 e2e 기준 스크린샷 */
export const APPS: ExampleApp[] = [
  { id: 'job-monitor', name: 'Job Monitor', monogram: 'JM', hue: 195, tagline: '배치 잡과 파이프라인을 지켜보는 운영 콘솔', identity: 'hue 195 · cool · status-strip · sidebar · compact · terse', archetypes: ['관측 벽', '원장', '콘솔', '캔버스'], shot: shotJobs, dir: 'examples/reference-app' },
  { id: 'dataset-explorer', name: 'Dataset Explorer', monogram: 'DE', hue: 310, tagline: '데이터셋을 찾고, 읽고, 질문하는 데이터 카탈로그', identity: 'hue 310 · warm · search-hero · sidebar · comfortable · friendly', archetypes: ['원장', '문서', '대화'], shot: shotDatasets, dir: 'examples/dataset-explorer' },
  { id: 'release-desk', name: 'Release Desk', monogram: 'RD', hue: 235, tagline: '릴리스를 승인하고 배포 일정을 관리하는 데스크', identity: 'hue 235 · neutral · stage-rail · sidebar · compact · procedural', archetypes: ['원장', '보드', '트리아지', '일정'], shot: shotReleases, dir: 'examples/release-desk' },
  { id: 'se-home', name: 'SE Home', monogram: 'SE', hue: 350, tagline: '사내 서비스로 들어가는 입구', identity: 'hue 350 · warm · timeline-ribbon · topnav · comfortable · friendly', archetypes: ['허브'], shot: shotHome, dir: 'examples/se-home' },
]
