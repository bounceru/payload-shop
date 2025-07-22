// File: src/fields/CustomersField/components/Field.client.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useField } from '@payloadcms/ui'
import Select, { ActionMeta, MultiValue, SingleValue } from 'react-select'

type Customer = {
  id: string;
  firstname?: string;
  lastname?: string;
  email?: string;
};

type Option = {
  value: string;
  label: string;
};

type Props = {
  path: string;
  readOnly: boolean;
  isMulti: boolean;
  shops?: any; // array of IDs if you want a filter
};

export function CustomersFieldComponentClient({
                                                path,
                                                readOnly,
                                                isMulti,
                                                shops,
                                              }: Props) {
  // Connect to Payload's form state
  const { value, setValue } = useField<string | string[]>({ path })
  const [customers, setCustomers] = useState<Customer[]>([])

  // 1) Fetch customers
  useEffect(() => {
    async function fetchCustomers() {
      let url = '/api/customers?limit=9999'
      if (shops && Array.isArray(shops)) {
        // e.g. ?where[shops][in]=xxx&where[shops][in]=yyy
        const shopFilters = shops.map(id => `where[shops][in]=${id}`).join('&')
        url += `&${shopFilters}`
      }

      const res = await fetch(url)
      if (!res.ok) {
        console.error('Error fetching customers:', res.status)
        return
      }
      const data = await res.json()
      if (data?.docs) {
        setCustomers(data.docs)
      }
    }

    fetchCustomers()
  }, [shops])

  // 2) Build react-select options
  const options: Option[] = customers.map((cust) => ({
    value: cust.id,
    label: `${cust.firstname || ''} ${cust.lastname || ''} (${cust.email || ''})`.trim(),
  }))

  // 3) Convert the field's raw value -> react-select
  function getSelectedOptions() {
    if (!value) return isMulti ? [] : null

    if (isMulti && Array.isArray(value)) {
      return value.map((id) => {
        const found = options.find((o) => o.value === id)
        return found || { value: id, label: id }
      })
    } else if (typeof value === 'string') {
      const found = options.find((o) => o.value === value)
      return found || { value, label: value }
    }
    return null
  }

  const selected = getSelectedOptions()

  // 4) Handle selection changes
  const handleChange = (
    selectedOpt: SingleValue<Option> | MultiValue<Option>,
    _meta: ActionMeta<Option>,
  ) => {
    if (isMulti) {
      const arr = Array.isArray(selectedOpt) ? selectedOpt : []
      setValue(arr.map((o) => o.value))
    } else {
      setValue(selectedOpt ? (selectedOpt as Option).value : '')
    }
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <label style={{ display: 'block', marginBottom: '0.5rem' }}>
        {isMulti ? 'Select Multiple Customers' : 'Select a Customer'}
      </label>
      <Select
        isMulti={isMulti}
        options={options}
        value={selected}
        onChange={handleChange}
        isDisabled={readOnly}
        placeholder="Select customers..."
      />
    </div>
  )
}
