export interface Worker {
  id: string;
  name: string;
  avatar: string;
  status: "active" | "idle" | "absent";
  utilizationPercent: number;
  unitsProduced: number;
  idleDurationMinutes: number;
  unitsPerHour: number;
  currentStation: string | undefined;
}

export interface Workstation {
  id: string;
  name: string;
  type: string;
  occupancyPercent: number;
  throughputRate: number;
}

export interface FactoryKPIs {
  shopUtilization: number;
  totalUnitsProduced: number;
  productionRateUPH: number;
  activeHours: number;
  idleHours: number;
}
