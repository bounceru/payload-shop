'use client'

import { useTranslation } from '@/context/TranslationsContext'
import ProgressBar from '../progress-bar/ProgressBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { FaCheck } from 'react-icons/fa'
import { useTheme } from '@/app/(dashboard)/dashboard/context/ThemeContext'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ShoppingBag,
  Sparkles,
  Store,
  Ticket,
  Trophy,
} from 'lucide-react'

export type OnboardingStep = {
  key: 'shop' | 'event' | 'ticketTypes' | 'addons' | 'seatmap'
  completed: boolean
  href: string
}

type Props = {
  steps: OnboardingStep[]
}

const stepIcons = {
  shop: Store,
  event: Calendar,
  ticketTypes: Ticket,
  addons: ShoppingBag,
  seatmap: MapPin,
}

const stepDescriptions = {
  shop: 'Stel je organisatie en branding in',
  event: 'Maak je eerste evenement aan',
  ticketTypes: 'Configureer ticket categorieën',
  addons: 'Voeg extra producten toe',
  seatmap: 'Ontwerp je zaalindeling',
}

export default function OnboardingProgress({ steps }: Props) {
  const { t } = useTranslation()
  const { branding } = useTheme()
  const ctaColor = branding?.primaryColorCTA || '#ED6D38'

  const completed = steps.filter((s) => s.completed).length
  const percent = Math.round((completed / steps.length) * 100)
  const currentIndex = steps.findIndex((s) => !s.completed)
  const isComplete = completed === steps.length

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-0 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${ctaColor} 2px, transparent 2px)`,
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: ctaColor }} />

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${ctaColor}15` }}
              >
                {isComplete ? (
                  <Trophy className="h-5 w-5" style={{ color: ctaColor }} />
                ) : (
                  <Sparkles className="h-5 w-5" style={{ color: ctaColor }} />
                )}
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">
                  {isComplete ? 'Setup Voltooid! 🎉' : t('dashboard.welcome')}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {isComplete
                    ? 'Je account is volledig geconfigureerd en klaar voor gebruik'
                    : t('dashboard.getStarted')}
                </p>
              </div>
            </div>

            {/* Progress stats */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  {completed} van de {steps.length} stappen voltooid
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  {isComplete ? 'Klaar!' : `${steps.length - completed} stappen resterend`}
                </span>
              </div>
            </div>

            {/* Enhanced progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Voortgang</span>
                <span className="text-sm font-bold" style={{ color: ctaColor }}>
                  {percent}%
                </span>
              </div>
              <ProgressBar progress={percent} color={ctaColor} className="h-3 rounded-full" />
            </div>
          </div>

          {/* Completion badge */}
          {isComplete && (
            <div className="ml-4">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                <Trophy className="h-4 w-4" />
                <span>Voltooid</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-2">
        {isComplete ? (
          // Completion state
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Geweldig werk!</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
              Je hebt alle setup stappen voltooid. Je account is nu volledig geconfigureerd en klaar om evenementen te
              organiseren.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                backgroundColor: ctaColor,

              }}
            >
              <span>Ga naar Evenementen</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          // Steps list
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isCurrent = idx === currentIndex
              const isNext = idx === currentIndex
              const Icon = stepIcons[step.key]

              const statusText = step.completed ? 'Voltooid' : isCurrent ? 'Huidige stap' : 'Wachtend'

              return (
                <div
                  key={step.key}
                  className={`group relative p-4 rounded-2xl border transition-all duration-200 ${step.completed
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : isCurrent
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {/* Step connector line */}
                  {idx < steps.length - 1 && (
                    <div
                      className={`absolute left-8 top-16 w-0.5 h-8 ${step.completed ? 'bg-green-300' : 'bg-gray-300'}`}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    {/* Step indicator */}
                    <div className="relative flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${step.completed
                          ? 'bg-green-500 text-white shadow-lg'
                          : isCurrent
                            ? 'bg-white border-2 text-gray-700 shadow-md'
                            : 'bg-white border-2 border-gray-300 text-gray-500'
                        }`}
                        style={isCurrent ? { borderColor: ctaColor } : {}}
                      >
                        {step.completed ? <FaCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>

                      {/* Step number badge */}
                      <div
                        className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step.completed
                          ? 'bg-green-600 text-white'
                          : isCurrent
                            ? 'text-white'
                            : 'bg-gray-400 text-white'
                        }`}
                        style={isCurrent ? { backgroundColor: ctaColor } : {}}
                      >
                        {idx + 1}
                      </div>
                    </div>

                    {/* Step content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{t(`dashboard.onboarding.${step.key}`)}</h3>
                          <p className="text-sm text-gray-600 mb-2">{stepDescriptions[step.key]}</p>

                          {/* Status indicator */}
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full ${step.completed
                                ? 'bg-green-500'
                                : isCurrent
                                  ? 'bg-blue-500 animate-pulse'
                                  : 'bg-gray-400'
                              }`}
                            />
                            <span
                              className={`text-xs font-medium ${step.completed ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-600'
                              }`}
                            >
                              {statusText}
                            </span>
                          </div>
                        </div>

                        {/* Action button */}
                        <div className="flex-shrink-0">
                          {step.completed ? (
                            <div
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Klaar</span>
                            </div>
                          ) : (
                            <Link href={step.href}>
                              <button
                                className={`group/btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isCurrent ? 'animate-pulse' : ''
                                }`}
                                style={{
                                  backgroundColor: isCurrent ? ctaColor : '#6B7280',

                                }}
                              >
                                <span>{isCurrent ? 'Doorgaan' : 'Start'}</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Motivational footer */}
        {!isComplete && (
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Bijna klaar!</h4>
                <p className="text-sm text-blue-700 leading-relaxed">
                  Voltooi alle stappen om het volledige potentieel van je account te benutten. Elke stap brengt je
                  dichter bij het organiseren van geweldige evenementen.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
