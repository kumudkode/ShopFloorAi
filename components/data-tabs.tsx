"use client"

import { Users, Cpu } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkerTable } from "./worker-table"
import { WorkstationTable } from "./workstation-table"

interface DataTabsProps {
  filterWorkerId: string | null
  filterWorkstationId: string | null
  searchQuery?: string
}

export function DataTabs({ filterWorkerId, filterWorkstationId, searchQuery = "" }: DataTabsProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <Card className="bg-card border-border/50 overflow-hidden">
        <Tabs defaultValue="workers" className="w-full">
          <CardHeader className="border-b border-border/50 pb-0 pt-4 px-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Detailed Metrics</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Track individual performance and station utilization</p>
              </div>
              <TabsList className="bg-secondary/50 border border-border/50 p-0.5 h-9">
                <TabsTrigger 
                  value="workers" 
                  className="gap-1.5 text-xs px-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm h-7"
                >
                  <Users className="size-3.5" />
                  <span className="hidden sm:inline">Worker Performance</span>
                  <span className="sm:hidden">Workers</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="workstations" 
                  className="gap-1.5 text-xs px-3 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm h-7"
                >
                  <Cpu className="size-3.5" />
                  <span className="hidden sm:inline">Station Utilization</span>
                  <span className="sm:hidden">Stations</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <TabsContent value="workers" className="mt-0">
              <WorkerTable filterWorkerId={filterWorkerId} searchQuery={searchQuery} />
            </TabsContent>
            <TabsContent value="workstations" className="mt-0">
              <WorkstationTable filterWorkstationId={filterWorkstationId} searchQuery={searchQuery} />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </section>
  )
}
