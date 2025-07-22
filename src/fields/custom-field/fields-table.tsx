'use client'
import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { getAllFields } from './api' // your fetch logic
import { FieldsPermission, PermissionAction } from './types'
import { PermissionCheckbox } from './PermissionCheckbox'
import { saveRole } from './api'


const PERMISSION_ACTIONS: { action: PermissionAction; label: string }[] = [
  { action: 'read', label: 'Read' },
  { action: 'create', label: 'Create' },
  { action: 'update', label: 'Update' },
  { action: 'delete', label: 'Delete' },
]

export default function FieldsTable({ doc }: { doc?: any }) {
  // doc will have shape: { id: string, fields: FieldsPermission[] }
  // We'll store doc.fields in local state:
  const [fieldsState, setFieldsState] = useState<FieldsPermission[]>([])

  // All fields from getAllFields
  const [allFields, setAllFields] = useState<{ collectionName: string; fieldName: string; }[]>([])
  const [isFormChanged, setIsFormChanged] = useState(false)

  // On mount, load doc.fields and fetch from /api/getAllFields
  useEffect(() => {
    // 1) Start with doc.fields if it exists
    const docFields: FieldsPermission[] = doc?.fields ?? []
    // docFields is e.g. [ { collectionName, fieldName, read, create, update, delete }, ...]
    setFieldsState(docFields)

    // 2) Fetch the actual collections/fields from the API
    async function fetchData() {
      try {
        const data = await getAllFields() // or direct fetch
        // data = [ { slug: 'users', fields: [{name: 'email', ...}, ...]}, ... ]
        // Flatten them to [ { collectionName: 'users', fieldName: 'email' }, ... ]
        const flattened: { collectionName: string; fieldName: string; }[] = []
        data.forEach((col: any) => {
          col.fields?.forEach((fld: any) => {
            flattened.push({
              collectionName: col.slug,
              fieldName: fld.name,
            })
          })
        })
        setAllFields(flattened)
      } catch (err) {
        console.error('Error fetching fields:', err)
      }
    }

    fetchData()
  }, [doc])

  // Track form changes
  useEffect(() => {
    // Compare fieldsState to doc.fields
    const initial = doc?.fields ?? []
    setIsFormChanged(JSON.stringify(fieldsState) !== JSON.stringify(initial))
  }, [fieldsState, doc])

  // For each (collectionName, fieldName) from `allFields`,
  // we want an object in fieldsState. If not present, default perms to false.
  const mergedFields: FieldsPermission[] = allFields.map((item) => {
    const existing = fieldsState.find(f =>
      f.collectionName === item.collectionName &&
      f.fieldName === item.fieldName,
    )
    return existing ?? {
      collectionName: item.collectionName,
      fieldName: item.fieldName,
      read: false,
      create: false,
      update: false,
      delete: false,
    }
  })

  function handleCheckboxChange(fieldObj: FieldsPermission, action: PermissionAction, checked: boolean) {
    // Update fieldsState
    setFieldsState(prev => {
      const idx = prev.findIndex(f =>
        f.collectionName === fieldObj.collectionName &&
        f.fieldName === fieldObj.fieldName,
      )
      if (idx >= 0) {
        // Update existing
        const updated = [...prev]
        updated[idx] = { ...updated[idx], [action]: checked }
        return updated
      } else {
        // Insert new
        return [...prev, { ...fieldObj, [action]: checked }]
      }
    })
  }

  // onSave: same logic as your existing CollectionsTable
  //   you can call a shared "saveRole" method or your own,
  //   passing the updated fieldsState in doc.fields
  async function handleSave() {
    if (!doc?.id) {
      toast.error('No doc ID found')
      return
    }
    try {
      // For example, call your same saveRole:
      await saveRole(doc.id, {
        name: doc.name,        // or doc?.name from state
        // collections: doc.collections, // unchanged
        fields: fieldsState,   // updated
      })
      toast.success('Fields updated successfully')
      setIsFormChanged(false)
    } catch (error) {
      console.error('Error saving fields perms:', error)
    }
  }

  return (
    <div className="p-4">
      <Toaster />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Field-Level Permissions</h2>
        <button
          onClick={handleSave}
          disabled={!isFormChanged}
          className={`px-4 py-2 rounded-lg ${isFormChanged ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
        >
          Save Fields
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Assign read/create/update/delete for each field in each collection.
      </p>

      <div className="space-y-4">
        {mergedFields.map((fieldObj) => (
          <div key={`${fieldObj.collectionName}.${fieldObj.fieldName}`} className="flex items-center justify-between">
                        <span className="font-medium">
                            {fieldObj.collectionName}.{fieldObj.fieldName}
                        </span>
            <div className="flex gap-4">
              {PERMISSION_ACTIONS.map(({ action, label }) => (
                <label key={action} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={!!fieldObj[action]}
                    onChange={(e) => handleCheckboxChange(fieldObj, action, e.target.checked)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
