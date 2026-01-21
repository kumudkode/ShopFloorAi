"use client"

import Link from "next/link"
import { CalendarDays, Factory, RefreshCw, ChevronDown, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { usePathname } from "next/navigation"
import { useDashboard } from "@/hooks/use-dashboard-data"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { refreshData, isLoading } = useDashboard()
  const pathname = usePathname()

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Factory className="size-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">ShopFloor AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 h-8 text-xs bg-transparent border-border/60 text-muted-foreground hover:text-foreground hover:border-border"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </Button>

          <Link href="/analytics">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 h-8 text-xs bg-transparent border-border/60 hover:text-foreground hover:border-border transition-colors",
                pathname === "/analytics" ? "text-primary border-primary/50 bg-primary/5" : "text-muted-foreground"
              )}
            >
              <BarChart2 className="size-3.5" />
              <span className="hidden sm:inline">Analytics</span>
            </Button>
          </Link>

          <Button variant="outline" size="sm" className="gap-2 h-8 text-xs bg-transparent border-border/60 text-muted-foreground hover:text-foreground hover:border-border">
            <CalendarDays className="size-3.5" />
            <span className="hidden sm:inline">Today&apos;s Shift</span>
            <ChevronDown className="size-3 opacity-50" />
          </Button>
          <Avatar className="size-8 border border-border/60">
            <AvatarFallback className="bg-secondary text-xs font-medium text-foreground">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
