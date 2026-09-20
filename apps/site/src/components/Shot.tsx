import { cn } from '@se/ui'

/** 화면 스크린샷 — 브라우저 창처럼 얇은 테두리와 상단 바. 사진이라 다크 모드에서도 라이트 화면을 보여 준다 */
export function Shot({ src, alt, className }: { src: string; alt: string; className?: string }) {
  return (
    <figure className={cn('overflow-hidden rounded-lg border border-line bg-surface shadow-xs', className)}>
      <div className="flex h-6 items-center gap-1.5 border-b border-line bg-surface-2 px-2.5" aria-hidden>
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
        <span className="size-2 rounded-full bg-line-strong" />
      </div>
      <img src={src} alt={alt} loading="lazy" className="block w-full" />
    </figure>
  )
}
