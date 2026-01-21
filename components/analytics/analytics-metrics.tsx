"use client"

import { TrendingUp, TrendingDown, Users, Cpu, Timer, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"

export function AnalyticsMetrics() {
  const { data, isLoading } = useDashboard()

  if (isLoading || !data) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl bg-card border border-border/50" />
          ))}
        </div>
      </section>
    )
  }

  const metrics = [
    {
      label: "Avg Worker Efficiency",
      value: `${Math.round(data.factory.average_worker_utilization)}%`,
      change: "+5.2%",
      trend: "up" as const,
      icon: Users,
      description: "vs last week",
      delay: "delay-0",
    },
    {
      label: "Station Uptime",
      value: `${Math.round((data.factory.occupied_stations / data.factory.total_stations) * 100)}%`,
      change: "+1.8%",
      trend: "up" as const,
      icon: Cpu,
      description: "current occupancy",
      delay: "delay-75",
    },
    {
      label: "Production Rate",
      value: `${data.factory.average_production_rate.toFixed(1)}/h`,
      change: "-8.5%",
      trend: "up" as const,
      icon: Timer,
      description: "units per hour",
      delay: "delay-150",
    },
    {
      label: "Total Units",
      value: data.factory.total_production_count.toLocaleString(),
      change: "-0.3%",
      trend: "down" as const,
      icon: Target,
      description: "units today",
      delay: "delay-200",
    },
  ]

  return (
    <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const isPositive = metric.trend === "up"
          return (
            <Card key={metric.label} className={cn(
              "group bg-card/40 backdrop-blur-md border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both hover:border-primary/50 transition-all hover:shadow-2xl hover:shadow-primary/10 cursor-default overflow-hidden relative",
              metric.delay
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <CardContent className="p-5 relative z-10">
                <div className="flex items-start justify-between">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary/80 border border-border/50 transition-all group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 group-hover:scale-110 group-hover:rotate-3 duration-500">
                    <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    isPositive ? "bg-success/10 text-success border border-success/20" : "bg-destructive/10 text-destructive border border-destructive/20"
                  )}>
                    {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                    {metric.change}
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-foreground tabular-nums tracking-tight group-hover:text-primary transition-colors duration-300">
                    {metric.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors">{metric.label}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{metric.description}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
