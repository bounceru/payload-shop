'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import Select, { MultiValue } from 'react-select'

// We'll flatten all fields from all collections into a single multi-select
type Option = {
  value: string; // e.g. "users.email"
  label: string; // e.g. "users: email"
};

const FieldsSelectUI: React.FC = () => {
  // 1. Hook into the hidden text field named "fields_data"
  const { value: storedJSON, setValue: setStoredJSON } = useField<string>({
    path: 'fields_data', // must match the hidden field name
  })

  // 2. Parse the stored JSON => array of string "collectionName.fieldName"
  let initialSelections: string[] = []
  try {
    if (storedJSON) {
      initialSelections = JSON.parse(storedJSON)
    }
  } catch (err) {
    console.error('Error parsing JSON from fields_data:', err)
  }

  const [selected, setSelected] = useState<string[]>(initialSelections)

  // 3. State for the flattened field options
  const [options, setOptions] = useState<Option[]>([])

  // 4. Fetch from /api/getAllFields and flatten
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const res = await fetch('/api/getAllFields')
        if (!res.ok) {
          throw new Error(`Error fetching fields. Status: ${res.status}`)
        }
        const data = await res.json()
        // data: Array of { slug, fields: Array<{ name, type, required }> }
        // Flatten them into { value: "collection.field", label: "collection: field" }
        const flattened: Option[] = []
        data.forEach((collection: any) => {
          const colSlug = collection.slug;
          (collection.fields || []).forEach((field: any) => {
            flattened.push({
              value: `${colSlug}.${field.name}`,
              label: `${colSlug}: ${field.name}`,
            })
          })
        })
        setOptions(flattened)
      } catch (err) {
        console.error('Failed to load fields:', err)
      }
    }

    fetchFields()
  }, [])

  // 5. Convert our string[] => React Select format
  const currentValue: Option[] = selected.map((entry) => {
    // entry is e.g. "users.email"
    const [colSlug, fieldName] = entry.split('.')
    return {
      value: entry,
      label: `${colSlug}: ${fieldName}`,
    }
  })

  // 6. Handle user picking fields
  const handleChange = useCallback(
    (selectedOptions: MultiValue<Option>) => {
      // e.g. [ { value: "users.email", label: "users: email" } ]
      const arrOfStrings = selectedOptions.map((opt) => opt.value)
      setSelected(arrOfStrings)
      setStoredJSON(JSON.stringify(arrOfStrings))
    },
    [setSelected, setStoredJSON],
  )

  return (
    <div>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        Fields
      </label>
      <Select
        isMulti
        options={options}
        value={currentValue}
        onChange={handleChange}
      />
    </div>
  )
}

export default FieldsSelectUI
