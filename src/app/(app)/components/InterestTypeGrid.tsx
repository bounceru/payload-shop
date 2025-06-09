"use client"
import Link from "next/link"
import type React from "react"

import { useState } from "react"
import { Heart, TrendingUp, Users, Sparkles } from "lucide-react"

const typeIcons: Record<string, string> = {
    concert: "🎶",
    theater: "🎭",
    comedy: "😂",
    dance: "💃",
    musical: "🎤",
    opera: "🎼",
    festival: "🎉",
    family: "👨‍👩‍👧‍👦",
    workshop: "🛠️",
    talk: "🗣️",
    other: "✨",
}

const typeColors: Record<string, string> = {
    concert: "#8B5CF6",
    theater: "#EF4444",
    comedy: "#F59E0B",
    dance: "#EC4899",
    musical: "#10B981",
    opera: "#6366F1",
    festival: "#F97316",
    family: "#06B6D4",
    workshop: "#84CC16",
    talk: "#64748B",
    other: "#8B5CF6",
}

const typeStats: Record<string, { events: number; trending?: boolean; popular?: boolean }> = {
    concert: { events: 45, trending: true },
    theater: { events: 23, popular: true },
    comedy: { events: 18, trending: true },
    dance: { events: 31 },
    musical: { events: 12, popular: true },
    opera: { events: 8 },
    festival: { events: 67, trending: true, popular: true },
    family: { events: 29, popular: true },
    workshop: { events: 15 },
    talk: { events: 22 },
    other: { events: 34 },
}

export default function InterestTypeGrid({ availableTypes }: { availableTypes: string[] }) {
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    if (!availableTypes || availableTypes.length === 0) {
        return (
            <section className="mt-16 bg-gradient-to-br from-gray-50 to-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Sparkles className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Geen categorieën beschikbaar</h3>
                    <p className="text-gray-500">Er zijn momenteel geen event categorieën beschikbaar.</p>
                </div>
            </section>
        )
    }

    const toggleFavorite = (type: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setFavorites((prev) => {
            const newFavorites = new Set(prev)
            if (newFavorites.has(type)) {
                newFavorites.delete(type)
            } else {
                newFavorites.add(type)
            }
            return newFavorites
        })
    }

    return (
        <section className="mt-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-red-200 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-100 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Enhanced Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                        <Sparkles className="h-4 w-4" />
                        <span>Personaliseer je ervaring</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Maak het{" "}
                        <span className=" text-orange-700">
                            persoonlijk
                        </span>
                    </h2>

                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Selecteer je interesses om op basis van je voorkeuren gepersonaliseerde aanbevelingen te ontvangen voor
                        evenementen
                    </p>
                </div>

                {/* Interest Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                    {availableTypes.map((type, index) => {
                        const stats = typeStats[type] || { events: 0 }
                        const color = typeColors[type] || "#8B5CF6"
                        const isFavorite = favorites.has(type)

                        return (
                            <Link
                                key={type}
                                href={`/${type}`}
                                className="group relative block focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 rounded-2xl"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                }}
                            >
                                <div className="relative h-full bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:border-gray-300 overflow-hidden">
                                    {/* Background gradient on hover */}
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                                        style={{ backgroundColor: color }}
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-1">
                                        {stats.trending && (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-600 text-xs font-medium">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="hidden sm:inline">Hot</span>
                                            </div>
                                        )}
                                        {stats.popular && (
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                                <Users className="h-3 w-3" />
                                                <span className="hidden sm:inline">Pop</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Favorite button */}
                                    <button
                                        onClick={(e) => toggleFavorite(type, e)}
                                        className="absolute top-3 left-3 p-1.5 rounded-full bg-white shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors z-10"
                                    >
                                        <Heart
                                            className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
                                                }`}
                                        />
                                    </button>

                                    {/* Icon */}
                                    <div className="flex justify-center mb-4 mt-6">
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-3"
                                            style={{ backgroundColor: `${color}15` }}
                                        >
                                            {typeIcons[type] ?? "✨"}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center">
                                        <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors capitalize">
                                            {type}
                                        </h3>

                                        <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-3">
                                            <span>{stats.events}</span>
                                            <span>evenementen</span>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                                            <div
                                                className="h-1.5 rounded-full transition-all duration-500 group-hover:w-full"
                                                style={{
                                                    backgroundColor: color,
                                                    width: `${Math.min((stats.events / 70) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>

                                        {/* CTA */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-sm font-semibold" style={{ color }}>
                                                Ontdek meer →
                                            </span>
                                        </div>
                                    </div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <div
                                            className="absolute inset-0 rounded-2xl"
                                            style={{
                                                background: `linear-gradient(45deg, transparent 30%, ${color}20 50%, transparent 70%)`,
                                                transform: "translateX(-100%)",
                                                animation: "shine 1.5s ease-in-out",
                                            }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>


            </div>

            <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </section>
    )
}
