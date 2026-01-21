"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, ChevronUp, ChevronDown, Cpu } from "lucide-react"
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
import { useWorkstations } from "@/hooks/use-dashboard-data"
import type { Workstation } from "@/lib/types"
import { cn } from "@/lib/utils"

interface WorkstationTableProps {
  filterWorkstationId: string | null
  searchQuery?: string
}

type SortKey = "occupancyPercent" | "throughputRate"
type SortDirection = "asc" | "desc"

function getOccupancyColor(percent: number): string {
  if (percent >= 85) return "text-success"
  if (percent >= 70) return "text-warning"
  return "text-muted-foreground"
}

function getProgressColor(percent: number): string {
  if (percent >= 85) return "bg-success"
  if (percent >= 70) return "bg-warning"
  return "bg-muted-foreground"
}

function getTypeStyles(type: string): string {
  const styles: Record<string, string> = {
    Assembly: "bg-primary/10 text-primary border-primary/20",
    Machining: "bg-chart-4/10 text-chart-4 border-chart-4/20",
    Welding: "bg-chart-5/10 text-chart-5 border-chart-5/20",
    Inspection: "bg-success/10 text-success border-success/20",
    Packaging: "bg-warning/10 text-warning border-warning/20",
  }
  return styles[type] ?? "bg-muted text-muted-foreground border-border/50"
}

export function WorkstationTable({ filterWorkstationId, searchQuery = "" }: WorkstationTableProps) {
  const { data: workstations, isLoading } = useWorkstations()
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

  const filteredAndSortedWorkstations = useMemo(() => {
    if (!workstations) return []

    let result = [...workstations]

    // Apply ID filter
    if (filterWorkstationId) {
      result = result.filter((ws) => ws.id === filterWorkstationId)
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter((ws) => 
        ws.name.toLowerCase().includes(query) ||
        ws.type.toLowerCase().includes(query)
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
  }, [workstations, filterWorkstationId, searchQuery, sortKey, sortDirection])

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="size-3 opacity-50" />
    return sortDirection === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />
  }

  if (isLoading) {
    return <WorkstationTableSkeleton />
  }

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/30 border-border/50 hover:bg-secondary/30">
            <TableHead className="text-xs font-medium text-muted-foreground w-[200px]">Station</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">Type</TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1.5 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort("occupancyPercent")}
              >
                Occupancy
                <SortIcon columnKey="occupancyPercent" />
              </Button>
            </TableHead>
            <TableHead className="text-xs font-medium text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 gap-1.5 h-7 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={() => handleSort("throughputRate")}
              >
                Throughput
                <SortIcon columnKey="throughputRate" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedWorkstations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-sm text-muted-foreground">
                No workstations found matching the current filter.
              </TableCell>
            </TableRow>
          ) : (
            filteredAndSortedWorkstations.map((station) => (
              <WorkstationRow key={station.id} station={station} />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function WorkstationRow({ station }: { station: Workstation }) {
  return (
    <TableRow className="border-border/30 hover:bg-secondary/20">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-secondary border border-border/50">
            <Cpu className="size-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">{station.name}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className={cn("text-[10px] font-medium px-2 py-0.5 border", getTypeStyles(station.type))}>
          {station.type}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3 min-w-[120px]">
          <div className="flex-1">
            <Progress 
              value={station.occupancyPercent} 
              className="h-1.5 bg-secondary"
              indicatorClassName={getProgressColor(station.occupancyPercent)}
            />
          </div>
          <span
            className={cn(
              "text-sm font-semibold tabular-nums min-w-[36px]",
              getOccupancyColor(station.occupancyPercent)
            )}
          >
            {station.occupancyPercent}%
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-medium text-foreground tabular-nums">{station.throughputRate}</span>
          <span className="text-xs text-muted-foreground">u/hr</span>
        </div>
      </TableCell>
    </TableRow>
  )
}

function WorkstationTableSkeleton() {
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <div className="bg-secondary/30 px-4 py-3 border-b border-border/50">
        <div className="flex gap-8">
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
          <Skeleton className="h-4 w-20 bg-muted" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
          <Skeleton className="size-8 rounded-md bg-muted" />
          <Skeleton className="h-4 w-28 bg-muted" />
          <Skeleton className="h-5 w-16 rounded-full bg-muted" />
          <Skeleton className="h-1.5 w-24 bg-muted" />
          <Skeleton className="h-4 w-16 bg-muted" />
        </div>
      ))}
    </div>
  )
}
