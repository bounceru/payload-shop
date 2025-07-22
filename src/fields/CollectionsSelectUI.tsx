'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useField } from '@payloadcms/ui'
import Select, { MultiValue } from 'react-select'

type Option = {
  value: string;
  label: string;
};

const CollectionsSelectUI: React.FC = () => {
  // 1. Hook into the HIDDEN text field named "collections_data"
  const {
    value: storedJSON,
    setValue: setStoredJSON,
  } = useField<string>({
    path: 'collections_data', // Must match the hidden field name
  })

  // Parse the JSON to get an array of selected slugs
  let initialSlugs: string[] = []
  try {
    if (storedJSON) {
      initialSlugs = JSON.parse(storedJSON)
    }
  } catch (err) {
    console.error('Error parsing JSON from collections_data:', err)
  }

  // 2. Local state for the array of currently selected slugs
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(initialSlugs)

  // 3. React state for all available slugs from the endpoint
  const [options, setOptions] = useState<Option[]>([])

  // 4. Fetch collection slugs from /api/getAllFields on mount
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const res = await fetch('/api/getAllFields')
        if (!res.ok) {
          throw new Error(`Error fetching. Status: ${res.status}`)
        }

        const data = await res.json()
        // data might be [{ slug: "users", fields: [...] }, { slug: "shops", ... }]
        const mapped: Option[] = data.map((item: any) => ({
          value: item.slug,
          label: item.slug,
        }))
        setOptions(mapped)
      } catch (error) {
        console.error('Failed to load collection slugs:', error)
      }
    }
    fetchCollections()
  }, [])

  // 5. Convert selectedSlugs -> array of { value, label } for React Select
  const currentValue: Option[] = selectedSlugs.map((slug) => ({
    value: slug,
    label: slug,
  }))

  // 6. Handle user selections
  const handleChange = useCallback(
    (selected: MultiValue<Option>) => {
      // Convert [ { value: 'users', label: 'users' }, ... ] -> ['users', ...]
      const slugs: string[] = selected.map((opt: Option) => opt.value)
      // Update local state
      setSelectedSlugs(slugs)
      // Serialize to JSON and store in the hidden text field
      setStoredJSON(JSON.stringify(slugs))
    },
    [setSelectedSlugs, setStoredJSON],
  )

  return (
    <div style={{ margin: '1rem 0' }}>
      <label style={{ display: 'block', marginBottom: 8 }}>
        Collections
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

export default CollectionsSelectUI
