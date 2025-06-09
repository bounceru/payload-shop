"use client"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { parseISO, compareDesc, isSameWeek } from "date-fns"
import { ArrowLeft, Calendar, Sparkles, Search, MapPin } from "lucide-react"

import EventRow from "./EventRow"
import InterestTypeGrid from "./InterestTypeGrid"

export default function GeneralHomePage({ events, emptyCategory }: { events: any[]; emptyCategory?: string }) {
    const [filters, setFilters] = useState({
        location: "",
        type: "",
        start: "",
        end: "",
    })
    const [searchQuery, setSearchQuery] = useState("")

    const searchParams = useSearchParams()

    const isCategoryPage = !!emptyCategory

    useEffect(() => {
        setFilters({
            location: searchParams.get("location") || "",
            type: searchParams.get("type") || "",
            start: searchParams.get("start") || "",
            end: searchParams.get("end") || "",
        })
        setSearchQuery(searchParams.get("search") || "")
    }, [searchParams])

    function isThisWeek(dateStr: string) {
        const eventDate = parseISO(dateStr)
        return isSameWeek(eventDate, new Date(), { weekStartsOn: 1 })
    }

    const recentEvents = [...events].sort((a, b) => compareDesc(new Date(a.createdAt), new Date(b.createdAt))).slice(0, 4)

    const weeklyEvents = events.filter((e) => isThisWeek(e.date))

    const popularEvents = events.filter((e) => !recentEvents.includes(e) && !weeklyEvents.includes(e)).slice(0, 4)

    const usedIds = new Set([...recentEvents, ...weeklyEvents, ...popularEvents].map((e) => e.id))

    const remainingEvents = events.filter((e) => !usedIds.has(e.id))

    const availableTypes = Array.from(
        new Set(events.map((e) => e.type).filter((type): type is string => typeof type === "string")),
    )

    const hasActiveFilters =
        searchQuery !== "" || Object.values(filters).some((filter) => filter !== "")

    return (
        <main className="w-full">
            {/* Enhanced Hero Section */}
            {!hasActiveFilters && (
                <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{
                            backgroundImage: `url('/static/general-hero.jpg?height=700&width=1400&text=Hero Background')`,
                        }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-center">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <div className="max-w-4xl mx-auto">


                                {/* Title */}
                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                                    Ontdek evenementen in <span className="text-orange-400">jouw buurt</span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed max-w-3xl mx-auto">
                                    Theater, musicals, dans, comedy en meer – allemaal op één plek. Vind je perfecte avond uit.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a
                                        href="#events"
                                        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 border-white text-white font-semibold hover:bg-white hover:text-gray-900 transition-all duration-200"
                                    >
                                        <Calendar className="h-5 w-5" />
                                        <span>Bekijk evenementen</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            )}



            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Category Header */}
                {isCategoryPage && (
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                            <span className="text-2xl">🎭</span>
                            <span>Categorie</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{emptyCategory} Evenementen</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Ontdek alle aankomende {emptyCategory?.toLowerCase()} evenementen in België. Van intieme voorstellingen
                            tot grootschalige producties.
                        </p>
                    </div>
                )}

                {/* Events Section */}
                <section id="events">
                    {events.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="max-w-md mx-auto">
                                <Calendar className="h-24 w-24 mx-auto text-gray-300 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Geen evenementen gevonden</h3>
                                <p className="text-gray-600 mb-8">
                                    {hasActiveFilters
                                        ? "Er zijn geen evenementen die voldoen aan je filters. Probeer je zoekcriteria aan te passen."
                                        : "Er zijn momenteel geen geplande evenementen beschikbaar."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {hasActiveFilters && (
                                        <button
                                            onClick={() => {
                                                setFilters({ location: "", type: "", start: "", end: "" })
                                                window.history.pushState({}, "", window.location.pathname)
                                            }}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            <Search className="h-4 w-4" />
                                            <span>Filters wissen</span>
                                        </button>
                                    )}
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Alle evenementen bekijken</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        searchQuery ? (
                            <div className="space-y-16">
                                <EventRow
                                    title="Zoekresultaten:"
                                    events={events}
                                    primaryColor="#ED6D38"
                                    icon="featured"
                                    featured
                                />
                            </div>
                        ) : (
                            <div className="space-y-16">
                                {/* Recent Events */}
                                {recentEvents.length > 0 && (
                                    <EventRow
                                        title="Nieuwe evenementen"
                                        subtitle="Pas toegevoegde evenementen die je niet wilt missen"
                                        events={recentEvents}
                                        primaryColor="#ED6D38"
                                        hideMoreButton
                                        icon="featured"
                                        featured
                                    />
                                )}

                                {/* This Week Events */}
                                {weeklyEvents.length > 0 && (
                                    <EventRow
                                        title="Deze week"
                                        subtitle="Evenementen die deze week plaatsvinden"
                                        events={weeklyEvents}
                                        primaryColor="#ED6D38"
                                        hideMoreButton
                                        icon="calendar"
                                    />
                                )}

                                {/* Popular Events */}
                                {popularEvents.length > 0 && (
                                    <EventRow
                                        title="Populaire evenementen"
                                        subtitle="De meest bekeken en geboekte evenementen"
                                        events={popularEvents}
                                        primaryColor="#ED6D38"
                                        icon="trending"
                                    />
                                )}

                                {/* Remaining Events */}
                                {remainingEvents.length > 0 && (
                                    <EventRow
                                        title="Meer evenementen"
                                        subtitle="Ontdek nog meer geweldige evenementen"
                                        events={remainingEvents}
                                        primaryColor="#ED6D38"
                                        initialVisible={8}
                                    />
                                )}
                            </div>
                        )
                    )}
                </section>
            </div>

            {/* Interest Types Section */}
            {availableTypes.length > 0 && (
                <section className="bg-gray-50">
                    <InterestTypeGrid availableTypes={availableTypes} />
                </section>
            )}


        </main>
    )
}
