import { AnalyticsData } from '@/src/lib/types/dashboard'

interface CacheEntry {
  data: AnalyticsData
  timestamp: number
}

const CACHE_TTL_MS = 60_000 // 1 menit
const memoryCache = new Map<string, CacheEntry>()
const inFlightRequests = new Map<string, Promise<AnalyticsData | null>>()

/**
 * Mengambil data analitik dari /api/analytics dengan in-memory cache & deduplikasi request.
 * Gunakan `forceRefresh = true` saat user menekan tombol Segarkan Data.
 */
export async function fetchAnalyticsCached(
  token?: string,
  forceRefresh = false
): Promise<AnalyticsData | null> {
  const cacheKey = token ? `auth:${token}` : 'public'

  if (!forceRefresh) {
    const cached = memoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }

    const existingRequest = inFlightRequests.get(cacheKey)
    if (existingRequest) {
      return existingRequest
    }
  }

  const requestPromise = (async () => {
    try {
      const url = token
        ? `/api/analytics?token=${encodeURIComponent(token)}`
        : '/api/analytics'
      const headers: HeadersInit = token
        ? { Authorization: `Bearer ${token}` }
        : {}

      const response = await fetch(url, { headers })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const resData = await response.json()
      const analyticsData: AnalyticsData | null = resData.data || null

      if (analyticsData) {
        memoryCache.set(cacheKey, {
          data: analyticsData,
          timestamp: Date.now(),
        })
      }

      return analyticsData
    } finally {
      inFlightRequests.delete(cacheKey)
    }
  })()

  inFlightRequests.set(cacheKey, requestPromise)
  return requestPromise
}

/**
 * Menghapus seluruh cache analitik (misal saat logout atau setelah submit survei baru).
 */
export function clearAnalyticsCache(): void {
  memoryCache.clear()
}

const adminMemoryCache = new Map<string, { data: any; timestamp: number }>()
const adminInFlight = new Map<string, Promise<any>>()

/**
 * Mengambil data endpoint admin dengan in-memory cache (TTL 60 detik) & deduplikasi request.
 */
export async function fetchAdminCached<T = any>(
  endpoint: string,
  token: string,
  forceRefresh = false
): Promise<T | null> {
  const cacheKey = `${endpoint}:${token}`

  if (!forceRefresh) {
    const cached = adminMemoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T
    }

    const existing = adminInFlight.get(cacheKey)
    if (existing) {
      return existing as Promise<T | null>
    }
  }

  const reqPromise = (async () => {
    try {
      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const json = await response.json()
      const result = json.data ?? null
      if (result !== null) {
        adminMemoryCache.set(cacheKey, {
          data: result,
          timestamp: Date.now(),
        })
      }
      return result as T | null
    } finally {
      adminInFlight.delete(cacheKey)
    }
  })()

  adminInFlight.set(cacheKey, reqPromise)
  return reqPromise
}
