"use client";

import useSWR from "swr";
import type {
  DashboardData,
  WorkerMetrics,
  WorkstationMetrics,
  FactoryMetrics,
  Worker,
} from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Main dashboard hook
export function useDashboard() {
  const { data, error, isLoading, mutate } = useSWR<{
    success: boolean;
    data: DashboardData;
  }>("/api/metrics", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  const refreshData = async () => {
    await fetch("/api/seed", { method: "POST" });
    mutate();
  };

  return {
    data: data?.data,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
    refreshData,
  };
}

// Worker-specific hook
export function useWorkers() {
  const { data, isLoading } = useDashboard();

  // Transform API data to match old interface for backward compatibility
  const workers: Worker[] | undefined = data?.workers.map(
    (w: WorkerMetrics) => ({
      id: w.worker_id,
      name: w.name,
      avatar: w.name
        .split(" ")
        .map((n) => n[0])
        .join(""),
      status: w.status,
      utilizationPercent: Math.round(w.utilization_percentage),
      unitsProduced: w.total_units_produced,
      idleDurationMinutes: w.total_idle_time_minutes,
      unitsPerHour: w.units_per_hour,
      currentStation: w.current_station,
    }),
  );

  return { data: workers, isLoading };
}

// Workstation-specific hook
export function useWorkstations() {
  const { data, isLoading } = useDashboard();

  const workstations = data?.workstations.map((ws: WorkstationMetrics) => ({
    id: ws.station_id,
    name: ws.name,
    type: ws.type,
    occupancyPercent: Math.round(ws.utilization_percentage),
    throughputRate: ws.throughput_rate,
    totalUnitsProduced: ws.total_units_produced,
    status: ws.status,
  }));

  return { data: workstations, isLoading };
}

// Factory KPIs hook
export function useFactoryKPIs() {
  const { data, isLoading } = useDashboard();

  if (!data) return { data: null, isLoading };

  const factory = data.factory;
  const kpis = {
    shopUtilization: Math.round(factory.average_worker_utilization),
    totalUnitsProduced: factory.total_production_count,
    productionRateUPH: factory.average_production_rate,
    activeHours: Math.round(factory.total_productive_time_minutes / 60),
    idleHours: Math.round(
      (factory.total_workers * 8 * 60 - factory.total_productive_time_minutes) /
        60,
    ),
    activeWorkers: factory.active_workers,
    totalWorkers: factory.total_workers,
    occupiedStations: factory.occupied_stations,
    totalStations: factory.total_stations,
  };

  return { data: kpis, isLoading };
}
