import { ChevronDownIcon } from '@/app/(dashboard)/dashboard/icons'
import React, { useEffect, useState } from 'react'

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  /** For a placeholder, shown if internalValue == "" */
  placeholder?: string;
  /** Handler called when user picks a new value */
  onChange: (value: string) => void;

  className?: string;

  /** Uncontrolled usage => initial selected value only */
  defaultValue?: string;

  /** Controlled usage => the selected value. If present, we ignore defaultValue and become controlled. */
  value?: string;

  /** Disable the select. */
  isDisabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
                                         options,
                                         placeholder = 'Select an option',
                                         onChange,
                                         className = '',
                                         defaultValue = '',
                                         value, // optional => if provided, we become controlled
                                         isDisabled = false,
                                       }) => {
  // "Hybrid" approach: keep an internal state, but sync to `value` if present.
  const [internalValue, setInternalValue] = useState<string>(
    // If "value" is provided, use that; else fallback to defaultValue
    value ?? defaultValue ?? '',
  )

  // If the parent passes a "value" prop (controlled), update internal state whenever it changes
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value
    // Always update internal state
    setInternalValue(newVal)
    // Notify parent
    onChange(newVal)
  }

  return (
    <div className="relative">
      <select
        className={`
          h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-11 text-sm
          shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10
          dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800
          ${internalValue ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-400'}
          ${className}
        `}
        value={internalValue} // always use our internalValue
        onChange={handleChange}
        disabled={isDisabled}
      >
        {/* Render a disabled placeholder */}
        <option
          value=""
          disabled
          className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
        >
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="text-gray-700 dark:bg-gray-900 dark:text-gray-400"
          >
            {option.label}
          </option>
        ))}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        <ChevronDownIcon />
      </span>
    </div>
  )
}

export default Select
