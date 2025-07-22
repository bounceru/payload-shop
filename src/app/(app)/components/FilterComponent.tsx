'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Calendar, Check, ChevronDown, Filter, MapPin, RotateCcw, Search, X } from 'lucide-react'

const eventTypes = [
  { value: 'concert', label: 'Concert' },
  { value: 'theater', label: 'Theater' },
  { value: 'dance', label: 'Dans' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'musical', label: 'Musical' },
  { value: 'opera', label: 'Opera' },
  { value: 'family', label: 'Familie' },
  { value: 'talk', label: 'Lezing' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'festival', label: 'Festival' },
  { value: 'other', label: 'Overig' },
]

const provinces = [
  'Antwerpen',
  'Vlaams-Brabant',
  'Waals-Brabant',
  'West-Vlaanderen',
  'Oost-Vlaanderen',
  'Henegouwen',
  'Luik',
  'Limburg',
  'Luxemburg',
  'Namen',
  'Brussels Hoofdstedelijk Gewest',
]

type Props = {
  initialLocation?: string
  initialType?: string
  initialStartDate?: string
  initialEndDate?: string
  primaryColor?: string
}

export default function FilterComponent({
                                          initialLocation = '',
                                          initialType = '',
                                          initialStartDate = '',
                                          initialEndDate = '',
                                          primaryColor = '#ED6D38',
                                        }: Props) {
  const router = useRouter()

  const parseCSV = (input: string) => (input ? input.split(',') : [])
  const toCSV = (arr: string[]) => arr.join(',')

  const [location, setLocation] = useState<string[]>(parseCSV(initialLocation))
  const [type, setType] = useState<string[]>(parseCSV(initialType))
  const [startDate, setStartDate] = useState<string>(initialStartDate)
  const [endDate, setEndDate] = useState<string>(initialEndDate)

  // Dropdown states
  const [locationOpen, setLocationOpen] = useState(false)
  const [typeOpen, setTypeOpen] = useState(false)

  const locationRef = useRef<HTMLDivElement>(null)
  const typeRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setTypeOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocationToggle = (province: string) => {
    setLocation((prev) => (prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province]))
  }

  const handleTypeToggle = (eventType: string) => {
    setType((prev) => (prev.includes(eventType) ? prev.filter((t) => t !== eventType) : [...prev, eventType]))
  }

  const handleSearch = () => {
    const currentParams = new URLSearchParams(window.location.search)

    if (type.length) currentParams.set('type', toCSV(type))
    else currentParams.delete('type')

    if (location.length) currentParams.set('location', toCSV(location))
    else currentParams.delete('location')

    if (startDate) currentParams.set('start', startDate)
    else currentParams.delete('start')

    if (endDate) currentParams.set('end', endDate)
    else currentParams.delete('end')

    const typeSlug = type.length === 1 ? type[0] : ''
    const queryString = currentParams.toString()

    router.push(typeSlug ? `/${typeSlug}?${queryString}` : `/?${queryString}`)
  }

  const handleReset = () => {
    setLocation([])
    setType([])
    setStartDate('')
    setEndDate('')
    router.push('/')
  }

  const hasActiveFilters = location.length > 0 || type.length > 0 || startDate || endDate

  return (
    <div className="relative z-10 -mt-16 mb-12">
      <div
        className="bg-white border border-gray-200 shadow-lg rounded-2xl w-full max-w-7xl mx-auto p-6 backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <Filter className="h-5 w-5" style={{ color: primaryColor }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filter evenementen</h3>
            <p className="text-sm text-gray-600">Verfijn je zoekresultaten</p>
          </div>
          {hasActiveFilters && (
            <div className="ml-auto">
              <span
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                Filters actief
              </span>
            </div>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {/* Province Multi-Select */}
          <div className="relative" ref={locationRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provincie</label>
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 truncate">
                  {location.length === 0
                    ? 'Alle provincies'
                    : location.length === 1
                      ? location[0]
                      : `${location.length} geselecteerd`}
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-500 transition-transform ${locationOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {locationOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  {provinces.map((province) => (
                    <button
                      key={province}
                      onClick={() => handleLocationToggle(province)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${location.includes(province) ? 'border-transparent text-white' : 'border-gray-300 bg-white'
                        }`}
                        style={{
                          backgroundColor: location.includes(province) ? primaryColor : 'transparent',
                        }}
                      >
                        {location.includes(province) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm text-gray-900">{province}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event Type Multi-Select */}
          <div className="relative" ref={typeRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type evenement</label>
            <button
              onClick={() => setTypeOpen(!typeOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-gray-900 truncate">
                  {type.length === 0
                    ? 'Alle types'
                    : type.length === 1
                      ? eventTypes.find((t) => t.value === type[0])?.label
                      : `${type.length} geselecteerd`}
                </span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${typeOpen ? 'rotate-180' : ''}`} />
            </button>

            {typeOpen && (
              <div
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  {eventTypes.map((eventType) => (
                    <button
                      key={eventType.value}
                      onClick={() => handleTypeToggle(eventType.value)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${type.includes(eventType.value) ? 'border-transparent text-white' : 'border-gray-300 bg-white'
                        }`}
                        style={{
                          backgroundColor: type.includes(eventType.value) ? primaryColor : 'transparent',
                        }}
                      >
                        {type.includes(eventType.value) && <Check className="h-3 w-3" />}
                      </div>
                      <span className="text-sm text-gray-900">{eventType.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
              Startdatum
            </label>
            <div className="relative">
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
              Einddatum
            </label>
            <div className="relative">
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 lg:pt-7">
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: primaryColor,
              }}
            >
              <Search className="h-4 w-4" />
              <span>Zoeken</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="border-t border-gray-200 pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Actieve filters:</span>
              {location.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                >
                  <MapPin className="h-3 w-3" />
                  {loc}
                  <button
                    onClick={() => handleLocationToggle(loc)}
                    className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {type.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {eventTypes.find((et) => et.value === t)?.label}
                  <button
                    onClick={() => handleTypeToggle(t)}
                    className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {startDate && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  <Calendar className="h-3 w-3" />
                  Vanaf: {new Date(startDate).toLocaleDateString('nl-BE')}
                  <button
                    onClick={() => setStartDate('')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {endDate && (
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm">
                  <Calendar className="h-3 w-3" />
                  Tot: {new Date(endDate).toLocaleDateString('nl-BE')}
                  <button
                    onClick={() => setEndDate('')}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
