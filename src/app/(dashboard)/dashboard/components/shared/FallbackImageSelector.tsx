// File: /src/components/shared/FallbackImageSelector.tsx
'use client'

import React from 'react'
import Label from '../../components/form/Label'
import Button from '../../components/ui/button/Button'
import { Tooltip } from '@/app/(dashboard)/dashboard/components/ui/tooltip/Tooltip'
import { useTranslation } from '@/context/TranslationsContext'

interface FallbackImageSelectorProps {
  currentImageUrl?: string;
  /**
   * Called when user clicks "Choose from Library".
   * If omitted, the button is disabled (e.g., user lacks permission).
   */
  onLibraryClick?: () => void;
}

/**
 * Displays the fallback image (if available) and a button to open the Media Library.
 * This version includes a tooltip and (optionally) "required" text in the label.
 */
export default function FallbackImageSelector({
                                                currentImageUrl,
                                                onLibraryClick,
                                              }: FallbackImageSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="col-span-full">
      <Label>
        {t('dashboard.fallbackImage')}{' '}
        <Tooltip content={t('dashboard.fallbackImageTooltip')} position="right">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 h-4 w-4 text-gray-400 cursor-help"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
        </Tooltip>
      </Label>

      {/* If there's an existing fallback image, display it */}
      {currentImageUrl && (
        <div className="mb-2">
          <img
            src={currentImageUrl}
            alt={t('dashboard.fallbackImageAlt')}
            className="mb-2 h-32 w-32 rounded object-cover"
          />
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onLibraryClick ?? (() => {
          })}
          disabled={!onLibraryClick}
        >
          {t('dashboard.chooseFromLibrary')}
        </Button>
      </div>
    </div>
  )
}
