'use client'

import useSWR from 'swr'
import type { DashboardData } from '../types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<{ success: boolean; data: DashboardData }>(
    '/api/metrics',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true
    }
  )

  const refreshData = async () => {
    await fetch('/api/seed', { method: 'POST' })
    mutate()
  }

  return {
    data: data?.data,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
    refreshData
  }
}
