'use client'
import { cn } from '@/lib/utils'

interface LoadingDotsProps {
  color?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'bounce' | 'pulse' | 'wave' | 'spin' | 'fade'
  speed?: 'slow' | 'normal' | 'fast'
  className?: string
  dotCount?: 3 | 4 | 5
  label?: string
}

export default function LoadingDots({
                                      color = '#ED6D38',
                                      size = 'md',
                                      variant = 'bounce',
                                      speed = 'normal',
                                      className,
                                      dotCount = 3,
                                      label = 'Loading...',
                                    }: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }

  const spacingClasses = {
    sm: 'mx-1',
    md: 'mx-1.5',
    lg: 'mx-2',
    xl: 'mx-3',
  }

  const speedClasses = {
    slow: 'duration-1000',
    normal: 'duration-600',
    fast: 'duration-300',
  }

  const dots = Array.from({ length: dotCount }, (_, i) => i)

  const getAnimationDelay = (index: number) => {
    const baseDelay = speed === 'slow' ? 200 : speed === 'fast' ? 100 : 150
    return `${index * baseDelay}ms`
  }

  const renderDots = () => {
    switch (variant) {
      case 'pulse':
        return dots.map((_, index) => (
          <div
            key={index}
            className={cn('rounded-full animate-pulse', sizeClasses[size], spacingClasses[size], speedClasses[speed])}
            style={{
              backgroundColor: color,
              animationDelay: getAnimationDelay(index),
            }}
          />
        ))

      case 'wave':
        return dots.map((_, index) => (
          <div
            key={index}
            className={cn('rounded-full animate-bounce', sizeClasses[size], spacingClasses[size])}
            style={{
              backgroundColor: color,
              animationDelay: getAnimationDelay(index),
              animationDuration: speed === 'slow' ? '1s' : speed === 'fast' ? '0.4s' : '0.6s',
            }}
          />
        ))

      case 'spin':
        return (
          <div className="relative">
            {dots.map((_, index) => (
              <div
                key={index}
                className={cn('absolute rounded-full animate-spin', sizeClasses[size])}
                style={{
                  backgroundColor: color,
                  opacity: 1 - index * 0.2,
                  animationDelay: getAnimationDelay(index),
                  animationDuration: speed === 'slow' ? '2s' : speed === 'fast' ? '0.8s' : '1.2s',
                  transform: `rotate(${index * (360 / dotCount)}deg) translateX(${size === 'sm' ? '12px' : size === 'md' ? '20px' : size === 'lg' ? '28px' : '36px'})`,
                }}
              />
            ))}
          </div>
        )

      case 'fade':
        return dots.map((_, index) => (
          <div
            key={index}
            className={cn('rounded-full', sizeClasses[size], spacingClasses[size])}
            style={{
              backgroundColor: color,
              animation: `fadeInOut ${speed === 'slow' ? '1.5s' : speed === 'fast' ? '0.8s' : '1.2s'} infinite`,
              animationDelay: getAnimationDelay(index),
            }}
          />
        ))

      default: // bounce
        return dots.map((_, index) => (
          <div
            key={index}
            className={cn('rounded-full', sizeClasses[size], spacingClasses[size])}
            style={{
              backgroundColor: color,
              animation: `bounceUpDown ${speed === 'slow' ? '1.2s' : speed === 'fast' ? '0.4s' : '0.8s'} infinite`,
              animationDelay: getAnimationDelay(index),
            }}
          />
        ))
    }
  }

  return (
    <div
      className={cn('flex justify-center items-center py-8', variant === 'spin' ? 'relative' : 'flex-row', className)}
      role="status"
      aria-label={label}
    >
      <div className={cn('flex items-center', variant === 'spin' ? 'relative w-16 h-16' : 'justify-center')}>
        {renderDots()}
      </div>

      <style jsx>{`
        @keyframes bounceUpDown {
          0%, 80%, 100% {
            transform: translateY(0);
            opacity: 1;
          }
          40% {
            transform: translateY(-16px);
            opacity: 0.7;
          }
        }
        
        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes spinAround {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
