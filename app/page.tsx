"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/header"
import { KPIGrid } from "@/components/kpi-grid"
import { FilterBar } from "@/components/filter-bar"
import { DataTabs } from "@/components/data-tabs"

export default function DashboardPage() {
  const [selectedWorker, setSelectedWorker] = useState<string | null>(null)
  const [selectedWorkstation, setSelectedWorkstation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const handleReset = () => {
    setSelectedWorker(null)
    setSelectedWorkstation(null)
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="pb-8">
        <KPIGrid />
        <FilterBar
          selectedWorker={selectedWorker}
          selectedWorkstation={selectedWorkstation}
          searchQuery={searchQuery}
          onWorkerChange={setSelectedWorker}
          onWorkstationChange={setSelectedWorkstation}
          onSearchChange={setSearchQuery}
          onReset={handleReset}
        />
        <div className="pt-5">
          <DataTabs
            filterWorkerId={selectedWorker}
            filterWorkstationId={selectedWorkstation}
            searchQuery={searchQuery}
          />
        </div>
      </main>
    </div>
  )
}
