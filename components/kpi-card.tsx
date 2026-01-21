"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPICardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  progress?: number
  trend?: { value: number; direction: "up" | "down" | "neutral" }
  isLoading?: boolean
}

function CircularProgress({
  value,
}: {
  value: number
}) {
  const circumference = 2 * Math.PI * 36
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = () => {
    if (value >= 85) return "stroke-success"
    if (value >= 70) return "stroke-warning"
    return "stroke-muted-foreground"
  }

  return (
    <div className="relative size-20">
      <svg className="size-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-border/40"
        />
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn("transition-all duration-700 ease-out", getColor())}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{value}%</span>
      </div>
    </div>
  )
}

function TrendIndicator({ trend }: { trend: { value: number; direction: "up" | "down" | "neutral" } }) {
  const Icon = trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus
  const colorClass = trend.direction === "up" ? "text-success" : trend.direction === "down" ? "text-destructive" : "text-muted-foreground"

  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", colorClass)}>
      <Icon className="size-3" />
      <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
    </div>
  )
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  progress,
  trend,
  isLoading = false,
}: KPICardProps) {
  if (isLoading) {
    return (
      <Card className="bg-card border-border/50 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24 bg-muted" />
              <Skeleton className="h-8 w-20 bg-muted" />
              <Skeleton className="h-3 w-16 bg-muted" />
            </div>
            <Skeleton className="size-10 rounded-lg bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border/50 overflow-hidden transition-all hover:border-border/80 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
            </div>
            <div className="flex items-end gap-3">
              <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
              {trend && <TrendIndicator trend={trend} />}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {progress !== undefined && (
            <CircularProgress value={progress} />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
