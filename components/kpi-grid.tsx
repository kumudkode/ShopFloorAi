"use client"

import { Activity, Clock, Gauge, Package } from "lucide-react"
import { KPICard } from "./kpi-card"
import { useFactoryKPIs } from "@/hooks/use-dashboard-data"

export function KPIGrid() {
  const { data: kpis, isLoading } = useFactoryKPIs()

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 pb-4 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">Performance Overview</h2>
        <p className="text-sm text-muted-foreground">Real-time manufacturing metrics</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Shop Utilization"
          value={`${kpis?.shopUtilization ?? 0}%`}
          icon={Gauge}
          progress={kpis?.shopUtilization}
          trend={{ value: 3.2, direction: "up" }}
          isLoading={isLoading}
        />
        <KPICard
          title="Units Produced"
          value={kpis?.totalUnitsProduced?.toLocaleString() ?? "0"}
          subtitle="Today's output"
          icon={Package}
          trend={{ value: 8.1, direction: "up" }}
          isLoading={isLoading}
        />
        <KPICard
          title="Production Rate"
          value={kpis?.productionRateUPH ?? 0}
          subtitle="Units per hour"
          icon={Activity}
          trend={{ value: -1.4, direction: "down" }}
          isLoading={isLoading}
        />
        <KPICard
          title="Active Time"
          value={`${kpis?.activeHours ?? 0}h`}
          subtitle={`${kpis?.idleHours ?? 0}h idle time`}
          icon={Clock}
          progress={
            kpis
              ? Math.round(
                (kpis.activeHours / (kpis.activeHours + kpis.idleHours)) * 100
              )
              : 0
          }
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}
