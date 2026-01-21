"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from "recharts"
import { useWorkstations } from "@/hooks/use-dashboard-data"
import { Skeleton } from "@/components/ui/skeleton"

const productionData = [
  { hour: "6am", units: 45, target: 50 },
  { hour: "7am", units: 62, target: 50 },
  { hour: "8am", units: 78, target: 50 },
  { hour: "9am", units: 85, target: 50 },
  { hour: "10am", units: 72, target: 50 },
  { hour: "11am", units: 68, target: 50 },
  { hour: "12pm", units: 55, target: 50 },
  { hour: "1pm", units: 48, target: 50 },
  { hour: "2pm", units: 82, target: 50 },
  { hour: "3pm", units: 91, target: 50 },
  { hour: "4pm", units: 76, target: 50 },
  { hour: "5pm", units: 59, target: 50 },
]

const utilizationData = [
  { name: "Mon", workers: 82, stations: 88 },
  { name: "Tue", workers: 85, stations: 91 },
  { name: "Wed", workers: 78, stations: 84 },
  { name: "Thu", workers: 88, stations: 92 },
  { name: "Fri", workers: 84, stations: 87 },
  { name: "Sat", workers: 72, stations: 78 },
  { name: "Sun", workers: 65, stations: 70 },
]

export function AnalyticsCharts() {
  const { data: workstations, isLoading } = useWorkstations()

  if (isLoading || !workstations) {
    return (
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px] w-full bg-card lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[350px] w-full bg-card rounded-xl" />
          <Skeleton className="h-[350px] w-full bg-card rounded-xl" />
        </div>
      </section>
    )
  }

  const stationPerformance = workstations.map(ws => ({
    name: ws.name,
    efficiency: ws.occupancyPercent,
    color: ws.occupancyPercent > 80 ? "hsl(142, 76%, 36%)" : ws.occupancyPercent > 50 ? "hsl(217, 91%, 60%)" : "hsl(31, 97%, 55%)"
  })).sort((a, b) => b.efficiency - a.efficiency)
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Production Output Chart */}
        <Card className="group bg-card/40 backdrop-blur-md border-border/50 lg:col-span-2 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary animate-pulse" />
              Production Output
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Units produced per hour vs target (Live Simulation)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={productionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 18%)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)' }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)' }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 6%, 10%)',
                      border: '1px solid hsl(240, 5%, 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    cursor={{ stroke: 'hsl(240, 5%, 18%)', strokeWidth: 1 }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="hsl(240, 4%, 46%)"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    name="Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="units"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUnits)"
                    name="Actual"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Utilization Chart */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">Weekly Utilization</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Worker vs station utilization rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={utilizationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 18%)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)' }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)' }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                    domain={[60, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 6%, 10%)',
                      border: '1px solid hsl(240, 5%, 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="workers"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(217, 91%, 60%)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                    name="Workers"
                    animationDuration={1500}
                  />
                  <Line
                    type="monotone"
                    dataKey="stations"
                    stroke="hsl(142, 76%, 36%)"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(142, 76%, 36%)', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                    name="Stations"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Station Performance Chart */}
        <Card className="bg-card/40 backdrop-blur-md border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 hover:border-primary/30 transition-all hover:shadow-2xl hover:shadow-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold text-foreground">Station Performance</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Live efficiency by workstation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stationPerformance}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
                  barSize={12}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 5%, 18%)" horizontal={false} vertical={true} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)' }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: 'hsl(240, 4%, 46%)', fontWeight: 500 }}
                    axisLine={{ stroke: 'hsl(240, 5%, 18%)' }}
                    tickLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(240, 6%, 10%)',
                      border: '1px solid hsl(240, 5%, 18%)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    cursor={{ fill: 'hsl(240, 5%, 18%)', opacity: 0.4 }}
                    formatter={(value: number) => [`${value}%`, 'Efficiency']}
                  />
                  {/* Background Bar for "Track" look */}
                  <Bar
                    dataKey={() => 100}
                    fill="hsl(240, 5%, 18%)"
                    radius={[0, 4, 4, 0]}
                    xAxisId={0}
                    barSize={12}
                    isAnimationActive={false}
                    tooltipType="none"
                  />
                  <Bar
                    dataKey="efficiency"
                    radius={[0, 4, 4, 0]}
                    animationDuration={1500}
                    animationBegin={300}
                  >
                    {stationPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
