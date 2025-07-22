import React, { ChangeEvent, FC } from 'react'
import { Tooltip } from '@/app/(dashboard)/dashboard/components/ui/tooltip/Tooltip'

interface InputProps {
  label?: string;      // <-- new: optional label text
  tooltipContent?: string;  // <-- new: optional tooltip text

  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time' | string;
  id?: string;
  name?: string;

  value?: string | number;        // controlled usage
  defaultValue?: string | number; // uncontrolled usage

  placeholder?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;

  /**
   * Whether the input is required in HTML forms.
   */
  required?: boolean;
}

const Input: FC<InputProps> = ({
                                 label,
                                 tooltipContent,
                                 type = 'text',
                                 id,
                                 name,
                                 value,
                                 defaultValue,
                                 placeholder,
                                 onChange,
                                 className = '',
                                 min,
                                 max,
                                 step,
                                 disabled = false,
                                 success = false,
                                 error = false,
                                 hint,
                                 required = false,
                               }) => {
  let inputClasses =
    'h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm ' +
    'shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 ' +
    'dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ' +
    className

  // Handle states: disabled, error, success, or default
  if (disabled) {
    inputClasses +=
      ' text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed ' +
      'dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
  } else if (error) {
    inputClasses +=
      ' border-error-500 focus:border-error-300 focus:ring-error-500/20 ' +
      'dark:text-error-400 dark:border-error-500 dark:focus:border-error-800'
  } else if (success) {
    inputClasses +=
      ' border-success-500 focus:border-success-300 focus:ring-success-500/20 ' +
      'dark:text-success-400 dark:border-success-500 dark:focus:border-success-800'
  } else {
    // default style
    inputClasses +=
      ' bg-transparent text-gray-800 border-gray-300 ' +
      'focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90 ' +
      'dark:focus:border-brand-800'
  }

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block mb-1 font-medium text-gray-700 dark:text-white/90">
          {label}{' '}
          {required && <span className="text-red-500">*</span>}{' '}
          {tooltipContent && (
            <Tooltip content={tooltipContent} position="right">
              <span className="ml-1 text-gray-400 cursor-help">?</span>
            </Tooltip>
          )}
        </label>
      )}

      <div className="relative">
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
      </div>

      {hint && (
        <p
          className={
            'mt-1.5 text-xs ' +
            (error
              ? 'text-error-500'
              : success
                ? 'text-success-500'
                : 'text-gray-500')
          }
        >
          {hint}
        </p>
      )}
    </div>
  )
}

export default Input
