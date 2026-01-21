"use client"

import { DashboardHeader } from "@/components/header"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import { AnalyticsMetrics } from "@/components/analytics/analytics-metrics"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 size-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-0 right-1/4 size-[400px] bg-success/5 rounded-full blur-[100px] -z-10 animate-pulse duration-[8s]" />

      <DashboardHeader />

      <main className="pb-8 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-1000 ease-out">
        <section className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="mb-8 animate-in slide-in-from-left-8 fade-in duration-1000 ease-out">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8 bg-primary/50" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Intelligence</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight sm:text-4xl">Factory Analytics</h1>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">
              Real-time deep dive into production efficiency, worker utilization, and workstation throughput metrics.
            </p>
          </div>
        </section>

        <div className="space-y-2">
          <AnalyticsMetrics />
          <AnalyticsCharts />
        </div>
      </main>
    </div>
  )
}
