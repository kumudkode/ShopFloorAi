"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useWorkers } from "@/hooks/use-dashboard-data"
import type { Worker } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WorkerTableProps {
  filterWorkerId: string | null
  searchQuery?: string
}

type SortKey = "utilizationPercent" | "unitsProduced"
type SortDirection = "asc" | "desc"

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

function getUtilizationColor(percent: number): string {
  if (percent >= 85) return "text-success"
  if (percent >= 70) return "text-warning"
  return "text-muted-foreground"
}

function getProgressColor(percent: number): string {
  if (percent >= 85) return "bg-success"
  if (percent >= 70) return "bg-warning"
  return "bg-muted-foreground"
}

export function WorkerTable({ filterWorkerId, searchQuery = "" }: WorkerTableProps) {
  const { data: workers, isLoading } = useWorkers()
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const filteredAndSortedWorkers = useMemo(() => {
    if (!workers) return []

    let result = [...workers]

    // Apply ID filter
    if (filterWorkerId) {
      result = result.filter((w) => w.id === filterWorkerId)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((w) =>
        w.name.toLowerCase().includes(query) ||
        w.status.toLowerCase().includes(query)
      )
    }

    // Apply sorting
    if (sortKey) {
      result.sort((a, b) => {
        const aValue = a[sortKey]
        const bValue = b[sortKey]
        const modifier = sortDirection === "asc" ? 1 : -1
        return (aValue - bValue) * modifier
      })
    }

    return result
  }, [workers, filterWorkerId, searchQuery, sortKey, sortDirection])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="size-3 opacity-50" />
    return sortDirection === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
  }

  if (isLoading) {
    return <WorkerTableSkeleton />
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 border-border/50 hover:bg-secondary/30">
            <TableHead className="text-xs font-medium text-muted-foreground w-[200px]">Worker</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1.5 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort("utilizationPercent")}
              >
                Utilization
                <SortIcon columnKey="utilizationPercent" />
              </Button>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1.5 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort("unitsProduced")}
              >
                Units
                <SortIcon columnKey="unitsProduced" />
              </Button>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Idle Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedWorkers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-sm text-muted-foreground">
                No workers found matching the current filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedWorkers.map((worker) => (
              <WorkerRow key={worker.id} worker={worker} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function WorkerRow({ worker }: { worker: Worker }) {
  return (
    <TableRow className="border-border/30 hover:bg-secondary/20">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="size-8 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
              {worker.avatar}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground">{worker.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px] font-medium px-2 py-0.5",
            worker.status === "active"
              ? "bg-success/10 text-success border border-success/20"
              : worker.status === "idle"
              ? "bg-warning/10 text-warning border border-warning/20"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          )}
        >
          {worker.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex-1">
            <Progress
              value={worker.utilizationPercent}
              className="h-1.5 bg-secondary"
              indicatorClassName={getProgressColor(worker.utilizationPercent)}
            />
          </div>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums min-w-[36px]",
              getUtilizationColor(worker.utilizationPercent)
            )}
          >
            {worker.utilizationPercent}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-foreground tabular-nums">{worker.unitsProduced}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-muted-foreground tabular-nums">
          {formatDuration(worker.idleDurationMinutes)}
        </span>
      </TableCell>
    </TableRow>
  )
}

function WorkerTableSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <div className="bg-secondary/30 px-4 py-3 border-b border-border/50">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
          <Skeleton className="size-8 rounded-full bg-muted" />
          <Skeleton className="h-4 w-28 bg-muted" />
          <Skeleton className="h-5 w-14 rounded-full bg-muted" />
          <Skeleton className="h-1.5 w-24 bg-muted" />
          <Skeleton className="h-4 w-10 bg-muted" />
          <Skeleton className="h-4 w-14 bg-muted" />
        </div>
      ))}
    </div>
  )
}
