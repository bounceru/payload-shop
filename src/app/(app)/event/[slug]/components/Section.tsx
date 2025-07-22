'use client'
import type React from 'react'

export default function Section({
                                  title,
                                  children,
                                  primaryColor,
                                }: {
  title: string
  children: React.ReactNode
  primaryColor?: string
}) {
  const darkenColor = (hex: string, amount = 20) => {
    const hexToHSL = (H: string) => {
      let r = 0,
        g = 0,
        b = 0
      if (H.length === 4) {
        r = Number.parseInt(H[1] + H[1], 16)
        g = Number.parseInt(H[2] + H[2], 16)
        b = Number.parseInt(H[3] + H[3], 16)
      } else if (H.length === 7) {
        r = Number.parseInt(H[1] + H[2], 16)
        g = Number.parseInt(H[3] + H[4], 16)
        b = Number.parseInt(H[5] + H[6], 16)
      }
      r /= 255
      g /= 255
      b /= 255

      const max = Math.max(r, g, b),
        min = Math.min(r, g, b)
      let h = 0,
        s = 0,
        l = (max + min) / 2

      if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
        }
        h /= 6
      }

      h = Math.round(360 * h)
      s = Math.round(s * 100)
      l = Math.max(0, Math.min(100, l * 100 - amount))

      return `hsl(${h}, ${s}%, ${l}%)`
    }

    return hexToHSL(hex)
  }

  const titleColor = primaryColor ? darkenColor(primaryColor, 20) : '#111827'
  const accentColor = primaryColor || '#ED6D38'

  return (
    <section
      className="bg-white border border-gray-200 rounded-2xl px-4 md:px-8 py-8 shadow-sm hover:shadow-md transition-shadow duration-300 mb-8 relative overflow-hidden">
      {/* Subtle accent line */}

      {title && (
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* Icon accent */}
            <div className="w-3 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: accentColor }} />
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {title}
            </h2>
          </div>

          {/* Decorative underline */}
          <div className="flex items-center gap-3 ml-7">
            <div className="h-0.5 w-12 rounded-full" style={{ backgroundColor: accentColor }} />
            <div className="h-0.5 w-6 rounded-full opacity-50" style={{ backgroundColor: accentColor }} />
            <div className="h-0.5 w-3 rounded-full opacity-25" style={{ backgroundColor: accentColor }} />
          </div>
        </div>
      )}

      {/* Content wrapper with subtle background */}
      <div className="relative">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] rounded-xl"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${accentColor} 2px, transparent 2px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>

      {/* Subtle corner accent */}
      <div
        className="absolute bottom-4 right-4 w-8 h-8 rounded-full opacity-5"
        style={{ backgroundColor: accentColor }}
      />
    </section>
  )
}
