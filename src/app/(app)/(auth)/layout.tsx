'use client'

import React, { useEffect, useMemo, useState } from 'react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const words = ['Theatervoorstelling', 'Musical', 'Dansshow', 'Opera', 'Concert', 'Zakelijk evenement'] as const
  const [wordIndex, setWordIndex] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length > b.length ? a : b)),
    [words],
  )
  const logoUrl = '/static/stagepass-logo.png'

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeOut(true)
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length)
        setFadeOut(false)
      }, 500)
    }, 2000)
    return () => clearInterval(timer)
  }, [words.length])

  return (
    <div className="min-h-screen">


      {children}

    </div>
  )
}
