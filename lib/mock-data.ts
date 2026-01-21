import type { Worker, Workstation, FactoryKPIs } from "./types"

export const mockWorkers: Worker[] = [
  {
    id: "w1",
    name: "John Smith",
    avatar: "JS",
    status: "active",
    utilizationPercent: 92,
    unitsProduced: 145,
    idleDurationMinutes: 35,
    unitsPerHour: 18,
    currentStation: "Assembly Line A",
  },
  {
    id: "w2",
    name: "Maria Garcia",
    avatar: "MG",
    status: "active",
    utilizationPercent: 88,
    unitsProduced: 132,
    idleDurationMinutes: 48,
    unitsPerHour: 16,
    currentStation: "CNC Station 1",
  },
  {
    id: "w3",
    name: "David Chen",
    avatar: "DC",
    status: "idle",
    utilizationPercent: 76,
    unitsProduced: 98,
    idleDurationMinutes: 95,
    unitsPerHour: 12,
    currentStation: undefined,
  },
  {
    id: "w4",
    name: "Sarah Johnson",
    avatar: "SJ",
    status: "active",
    utilizationPercent: 94,
    unitsProduced: 156,
    idleDurationMinutes: 22,
    unitsPerHour: 20,
    currentStation: "Welding Bay",
  },
  {
    id: "w5",
    name: "Michael Brown",
    avatar: "MB",
    status: "active",
    utilizationPercent: 81,
    unitsProduced: 112,
    idleDurationMinutes: 72,
    unitsPerHour: 14,
    currentStation: "Quality Control",
  },
  {
    id: "w6",
    name: "Emily Davis",
    avatar: "ED",
    status: "idle",
    utilizationPercent: 67,
    unitsProduced: 78,
    idleDurationMinutes: 135,
    unitsPerHour: 10,
    currentStation: undefined,
  },
]

export const mockWorkstations: Workstation[] = [
  {
    id: "ws1",
    name: "Assembly Line A",
    type: "Assembly",
    occupancyPercent: 95,
    throughputRate: 42,
  },
  {
    id: "ws2",
    name: "CNC Station 1",
    type: "Machining",
    occupancyPercent: 88,
    throughputRate: 28,
  },
  {
    id: "ws3",
    name: "Welding Bay",
    type: "Welding",
    occupancyPercent: 72,
    throughputRate: 15,
  },
  {
    id: "ws4",
    name: "Quality Control",
    type: "Inspection",
    occupancyPercent: 91,
    throughputRate: 52,
  },
  {
    id: "ws5",
    name: "Packaging Unit",
    type: "Packaging",
    occupancyPercent: 84,
    throughputRate: 65,
  },
  {
    id: "ws6",
    name: "Assembly Line B",
    type: "Assembly",
    occupancyPercent: 79,
    throughputRate: 38,
  },
]

export const mockFactoryKPIs: FactoryKPIs = {
  shopUtilization: 85,
  totalUnitsProduced: 721,
  productionRateUPH: 89,
  activeHours: 42.5,
  idleHours: 6.8,
}

// Simulate API delay
export function simulateApiDelay<T>(data: T, delay = 800): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delay))
}
