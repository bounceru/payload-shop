"use client"

import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { useEffect, useState } from "react"
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Ticket,
  Eye,
  ShoppingBag,
  Star,
  BarChart3,
  Activity,
  Target,
  Award,
} from "lucide-react"

export type StatItem = {
  label: string
  value: number
  trend?: number // percentage change
  icon?: string // icon identifier
  color?: string // custom color
  prefix?: string // e.g., "€", "$"
  suffix?: string // e.g., "%", "k"
}

type Props = {
  stats: StatItem[]
  title?: string
  animated?: boolean
}

// Icon mapping for common stat types
const iconMap: Record<string, any> = {
  revenue: DollarSign,
  sales: TrendingUp,
  users: Users,
  visitors: Eye,
  events: Calendar,
  tickets: Ticket,
  orders: ShoppingBag,
  rating: Star,
  analytics: BarChart3,
  activity: Activity,
  target: Target,
  award: Award,
  default: BarChart3,
}

// Color schemes for different stat types
const colorSchemes = [
  { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", text: "text-blue-600", icon: "text-blue-600" },
  { bg: "from-green-500 to-green-600", light: "bg-green-50", text: "text-green-600", icon: "text-green-600" },
  { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", text: "text-purple-600", icon: "text-purple-600" },
  { bg: "from-orange-500 to-orange-600", light: "bg-orange-50", text: "text-orange-600", icon: "text-orange-600" },
  { bg: "from-red-500 to-red-600", light: "bg-red-50", text: "text-red-600", icon: "text-red-600" },
  { bg: "from-indigo-500 to-indigo-600", light: "bg-indigo-50", text: "text-indigo-600", icon: "text-indigo-600" },
]

function AnimatedCounter({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
}) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(value * easeOutQuart))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [value, duration])

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function DashboardStats({ stats, title = "Enkele cijfers", animated = true }: Props) {
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #3B82F6 2px, transparent 2px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500" />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">{title}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">Overzicht van je belangrijkste metrics</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const colorScheme = colorSchemes[index % colorSchemes.length]
            const IconComponent = iconMap[stat.icon || "default"]
            const hasPositiveTrend = stat.trend && stat.trend > 0
            const hasNegativeTrend = stat.trend && stat.trend < 0

            return (
              <div
                key={stat.label}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 hover:border-gray-200 overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${colorScheme.bg}`}
                />

                {/* Content */}
                <div className="relative z-10">
                  {/* Header with icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorScheme.light}`}>
                      <IconComponent className={`h-6 w-6 ${colorScheme.icon}`} />
                    </div>

                    {/* Trend indicator */}
                    {stat.trend !== undefined && (
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${hasPositiveTrend
                            ? "bg-green-100 text-green-700"
                            : hasNegativeTrend
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        <TrendingUp className={`h-3 w-3 ${hasNegativeTrend ? "rotate-180" : ""}`} />
                        <span>{Math.abs(stat.trend)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Value */}
                  <div className="mb-2">
                    <div className={`text-3xl font-bold ${colorScheme.text} leading-none`}>
                      {animated ? (
                        <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
                      ) : (
                        `${stat.prefix || ""}${stat.value.toLocaleString()}${stat.suffix || ""}`
                      )}
                    </div>
                  </div>

                  {/* Label */}
                  <div className="text-sm font-medium text-gray-600 leading-tight">{stat.label}</div>

                  {/* Trend description */}
                  {stat.trend !== undefined && (
                    <div className="mt-2 text-xs text-gray-500">
                      {hasPositiveTrend ? "↗ Stijging" : hasNegativeTrend ? "↘ Daling" : "→ Stabiel"} t.o.v. vorige
                      periode
                    </div>
                  )}
                </div>

                {/* Decorative corner element */}
                <div
                  className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-full opacity-10 bg-gradient-to-br ${colorScheme.bg}`}
                />

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary footer */}
        {stats.length > 0 && (
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">Totaal overzicht</h4>
                  <p className="text-xs text-gray-600">Gebaseerd op {stats.length} belangrijke metrics</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700">
                  Laatste update: {new Date().toLocaleDateString("nl-NL")}
                </div>
                <div className="text-xs text-gray-500">Real-time data</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
