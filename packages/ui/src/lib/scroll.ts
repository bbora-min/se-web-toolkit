/** 스크롤 영역이 바닥에 붙어 있는가 — 따라가기(Thread·LogViewer)가 같은 기준을 쓴다 */
export function isNearBottom(el: HTMLElement, threshold = 8) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
}
