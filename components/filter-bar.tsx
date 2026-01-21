"use client"

import { useState, useMemo } from "react"
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWorkers, useWorkstations } from "@/hooks/use-dashboard-data"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  selectedWorker: string | null
  selectedWorkstation: string | null
  searchQuery: string
  onWorkerChange: (value: string | null) => void
  onWorkstationChange: (value: string | null) => void
  onSearchChange: (value: string) => void
  onReset: () => void
}

export function FilterBar({
  selectedWorker,
  selectedWorkstation,
  searchQuery,
  onWorkerChange,
  onWorkstationChange,
  onSearchChange,
  onReset,
}: FilterBarProps) {
  const { data: workers } = useWorkers()
  const { data: workstations } = useWorkstations()
  const [isFocused, setIsFocused] = useState(false)

  const hasFilters = selectedWorker !== null || selectedWorkstation !== null || searchQuery.length > 0
  const activeFilterCount = (selectedWorker ? 1 : 0) + (selectedWorkstation ? 1 : 0) + (searchQuery ? 1 : 0)

  // Filter suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 1) return { workers: [], workstations: [] }
    
    const query = searchQuery.toLowerCase()
    const filteredWorkers = workers?.filter(w => 
      w.name.toLowerCase().includes(query)
    ).slice(0, 3) ?? []
    const filteredWorkstations = workstations?.filter(ws => 
      ws.name.toLowerCase().includes(query) || ws.type.toLowerCase().includes(query)
    ).slice(0, 3) ?? []
    
    return { workers: filteredWorkers, workstations: filteredWorkstations }
  }, [searchQuery, workers, workstations])

  const hasSuggestions = suggestions.workers.length > 0 || suggestions.workstations.length > 0

  return (
    <section className="border-y border-border/50 bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search workers or stations..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                className="pl-8 pr-8 h-9 bg-secondary/50 border-border/50 text-sm placeholder:text-muted-foreground/60 focus:bg-secondary"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
              
              {/* Search suggestions dropdown */}
              {isFocused && hasSuggestions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-lg shadow-lg overflow-hidden z-50">
                  {suggestions.workers.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/30">
                        Workers
                      </div>
                      {suggestions.workers.map((worker) => (
                        <button
                          key={worker.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
                          onClick={() => {
                            onWorkerChange(worker.id)
                            onSearchChange("")
                          }}
                        >
                          <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">
                            {worker.avatar}
                          </div>
                          <span className="text-foreground">{worker.name}</span>
                          <span className={cn(
                            "ml-auto text-xs px-1.5 py-0.5 rounded",
                            worker.status === "active" 
                              ? "bg-success/10 text-success" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {worker.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {suggestions.workstations.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-secondary/30">
                        Workstations
                      </div>
                      {suggestions.workstations.map((station) => (
                        <button
                          key={station.id}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-secondary/50 flex items-center gap-2"
                          onClick={() => {
                            onWorkstationChange(station.id)
                            onSearchChange("")
                          }}
                        >
                          <div className="flex size-6 items-center justify-center rounded bg-secondary text-muted-foreground">
                            <Search className="size-3" />
                          </div>
                          <span className="text-foreground">{station.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">{station.type}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SlidersHorizontal className="size-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </div>

            <Select
              value={selectedWorker ?? "all"}
              onValueChange={(value) =>
                onWorkerChange(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[150px] h-8 text-xs bg-secondary/50 border-border/50">
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Workers</SelectItem>
                {workers?.map((worker) => (
                  <SelectItem key={worker.id} value={worker.id} className="text-xs">
                    {worker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedWorkstation ?? "all"}
              onValueChange={(value) =>
                onWorkstationChange(value === "all" ? null : value)
              }
            >
              <SelectTrigger className="w-[160px] h-8 text-xs bg-secondary/50 border-border/50">
                <SelectValue placeholder="All Workstations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Workstations</SelectItem>
                {workstations?.map((station) => (
                  <SelectItem key={station.id} value={station.id} className="text-xs">
                    {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
