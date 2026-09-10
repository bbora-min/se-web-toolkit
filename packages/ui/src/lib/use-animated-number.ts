import * as React from 'react'

/**
 * 숫자가 바뀔 때 400ms 동안 트윈. 갱신이 "일어났다"는 걸 눈이 알아채게.
 * reduced-motion이면 즉시 반영.
 */
export function useAnimatedNumber(target: number, duration = 400): number {
  const [value, setValue] = React.useState(target)
  const fromRef = React.useRef(target)
  React.useEffect(() => {
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || fromRef.current === target) {
      fromRef.current = target
      setValue(target)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(from + (target - from) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else fromRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return value
}
