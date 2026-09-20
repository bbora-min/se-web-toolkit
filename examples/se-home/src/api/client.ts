import { createApiClient } from '@se/ui'

/** 백엔드 접점은 여기 한 곳. VITE_API_BASE 가 비어 있으면 MSW 목이 /api 를 응답한다 */
export const api = createApiClient()
export { ApiError } from '@se/ui'
