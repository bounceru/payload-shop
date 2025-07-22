'use client'
import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { getAllFields, saveRole } from './api'
import {
  PermissionAction,
  RoleDoc,
  CollectionPermission,
  FieldsPermission,
} from './types'

/** For collections => read/create/update/delete */
const COLLECTION_ACTIONS: { action: PermissionAction; label: string }[] = [
  { action: 'read', label: 'Read' },
  { action: 'create', label: 'Create' },
  { action: 'update', label: 'Update' },
  { action: 'delete', label: 'Delete' },
]

/** For fields => only read + update */
const FIELD_ACTIONS: PermissionAction[] = ['read', 'update']

interface CollectionsAndFieldsProps {
  collectionNames: string[];
  doc?: RoleDoc; // doc includes doc.id, doc.name, doc.collections, doc.fields
}

type CollapsedMap = Record<string, boolean>;

export default function CollectionsAndFieldsTable({
                                                    collectionNames,
                                                    doc,
                                                  }: CollectionsAndFieldsProps) {
  const [roleName, setRoleName] = useState(doc?.name || '')
  const [initialRoleName] = useState(doc?.name || '')

  // --- Collections-level perms
  const [collectionsPermissions, setCollectionsPermissions] = useState<
    CollectionPermission[]
  >(
    doc?.collections?.length
      ? doc.collections
      : collectionNames.map((name) => ({
        collectionName: name,
        read: false,
        create: false,
        update: false,
        delete: false,
      })),
  )
  const [initialCollections] = useState<CollectionPermission[]>(
    doc?.collections || [],
  )

  // --- Fields-level perms
  const [fieldsPermissions, setFieldsPermissions] = useState<FieldsPermission[]>(
    doc?.fields || [],
  )
  const [initialFields] = useState<FieldsPermission[]>(doc?.fields || [])

  // Flattened fields from /api/getAllFields
  const [allCollectionFields, setAllCollectionFields] = useState<
    { collectionName: string; fieldName: string }[]
  >([])

  // Expand/collapse for each collection
  const [collapsedMap, setCollapsedMap] = useState<CollapsedMap>(() =>
    collectionNames.reduce((acc, col) => {
      acc[col] = true // default collapsed
      return acc
    }, {} as CollapsedMap),
  )

  const [isFormChanged, setIsFormChanged] = useState(false)

  // ---------------------------
  // Fetch all fields on mount
  // ---------------------------
  useEffect(() => {
    async function fetchAll() {
      try {
        const data = await getAllFields() // e.g. [ { slug, fields: [ { name }, ... ] }, ... ]
        const flattened: { collectionName: string; fieldName: string }[] = []
        data.forEach((col: any) => {
          col.fields?.forEach((fld: any) => {
            if (fld.name) {
              flattened.push({
                collectionName: col.slug,
                fieldName: fld.name,
              })
            }
          })
        })
        setAllCollectionFields(flattened)
      } catch (err) {
        console.error('Failed to fetch fields:', err)
      }
    }

    fetchAll()
  }, [])

  // ---------------------------
  // Track if form changed
  // ---------------------------
  useEffect(() => {
    const nameChanged = roleName !== initialRoleName
    const colChanged =
      JSON.stringify(collectionsPermissions) !== JSON.stringify(initialCollections)
    const fldChanged =
      JSON.stringify(fieldsPermissions) !== JSON.stringify(initialFields)
    setIsFormChanged(nameChanged || colChanged || fldChanged)
  }, [
    roleName,
    collectionsPermissions,
    fieldsPermissions,
    initialRoleName,
    initialCollections,
    initialFields,
  ])

  // ---------------------------
  // Role Name Handler
  // ---------------------------
  function handleRoleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRoleName(e.target.value)
  }

  // Expand/collapse toggler
  function toggleCollapsed(collectionName: string) {
    setCollapsedMap((prev) => ({
      ...prev,
      [collectionName]: !prev[collectionName],
    }))
  }

  // ---------------------------
  // COLLECTION checkboxes
  // ---------------------------
  function handleCollectionCheckbox(
    collectionName: string,
    action: PermissionAction,
    checked: boolean,
  ) {
    setCollectionsPermissions((prev) =>
      prev.map((colPerm) =>
        colPerm.collectionName === collectionName
          ? { ...colPerm, [action]: checked }
          : colPerm,
      ),
    )
  }

  // ---------------------------
  // FIELD checkboxes
  // ---------------------------
  function handleFieldCheckbox(
    collectionName: string,
    fieldName: string,
    action: PermissionAction /* "read" or "update" */,
    checked: boolean,
  ) {
    setFieldsPermissions((prev) => {
      const idx = prev.findIndex(
        (fp) => fp.collectionName === collectionName && fp.fieldName === fieldName,
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], [action]: checked }
        return updated
      } else {
        // Insert new
        return [
          ...prev,
          {
            collectionName,
            fieldName,
            read: false,
            create: false,
            update: false,
            delete: false,
            [action]: checked,
          },
        ]
      }
    })
  }

  // ------------------------------------------------------
  // “Select entire column” => affects BOTH collections & fields
  // except that "create"/"delete" won't apply to fields
  // ------------------------------------------------------
  function handleSelectAllColumn(action: PermissionAction, checked: boolean) {
    // 1) Collections always get toggled
    setCollectionsPermissions((prev) =>
      prev.map((colPerm) => ({
        ...colPerm,
        [action]: checked,
      })),
    )

    // 2) If action is "read" or "update", also apply to fields
    if (action === 'read' || action === 'update') {
      setFieldsPermissions((prev) =>
        prev.map((fld) => ({
          ...fld,
          [action]: checked,
        })),
      )
    }
  }

  // ------------------------------------------------------
  // “All Fields: Read” or “All Fields: Update” for
  // A SPECIFIC collection
  // ------------------------------------------------------
  function handleSelectAllFieldsInCollection(
    collectionName: string,
    action: PermissionAction,
    checked: boolean,
  ) {
    // We'll loop through all existing field perms or create new if missing
    // for every field in that collection.
    setFieldsPermissions((prev) => {
      const next = [...prev]

      // 1) Get all field slugs for this collection
      const fieldsForCollection = allCollectionFields.filter(
        (f) => f.collectionName === collectionName,
      )

      fieldsForCollection.forEach((fItem) => {
        const idx = next.findIndex(
          (fp) =>
            fp.collectionName === collectionName && fp.fieldName === fItem.fieldName,
        )
        if (idx >= 0) {
          // update existing
          next[idx] = { ...next[idx], [action]: checked }
        } else {
          // insert new
          next.push({
            collectionName,
            fieldName: fItem.fieldName,
            read: false,
            create: false,
            update: false,
            delete: false,
            [action]: checked,
          })
        }
      })
      return next
    })
  }

  // ------------------------------------------------------
  // “Select All Row” => toggles read + update for that single field
  // ------------------------------------------------------
  function handleSelectAllRow(
    collectionName: string,
    fieldName: string,
    allChecked: boolean,
  ) {
    setFieldsPermissions((prev) => {
      const idx = prev.findIndex(
        (fp) => fp.collectionName === collectionName && fp.fieldName === fieldName,
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          read: allChecked,
          update: allChecked,
        }
        return updated
      } else {
        // Insert new
        return [
          ...prev,
          {
            collectionName,
            fieldName,
            read: allChecked,
            create: false,
            update: allChecked,
            delete: false,
          },
        ]
      }
    })
  }

  // Save
  async function handleSave() {
    if (!roleName.trim()) {
      toast.error('Role name is required')
      return
    }
    try {
      await saveRole(doc?.id, {
        name: roleName,
        collections: collectionsPermissions,
        fields: fieldsPermissions,
      })
      setIsFormChanged(false)
      toast.success('Role updated successfully')
      // optional reload/redirect
      setTimeout(() => {
        window.location.replace('/admin/collections/roles')
      }, 800)
    } catch (error) {
      console.error('Error saving role:', error)
    }
  }

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="flex flex-col gap-4 p-8">
      <Toaster position="top-center" />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Role Permissions</h1>
        <button
          onClick={handleSave}
          disabled={!isFormChanged}
          className={`px-4 py-2 rounded-lg transition-colors ${isFormChanged
            ? 'bg-blue-500 hover:bg-blue-600 text-white cursor-pointer'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Save Changes
        </button>
      </div>

      {/* Role Name */}
      <div className="flex flex-col gap-2">
        <h2>Role Name:</h2>
        <input
          type="text"
          value={roleName}
          onChange={handleRoleNameChange}
          className="border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full"
        />
      </div>

      <h2 className="text-lg font-bold">Collections &amp; Fields</h2>
      <p className="text-sm text-gray-500">
        Collections can have read/create/update/delete. Fields only have read/update.
      </p>

      {/* "Select Entire Column" row => affects BOTH collections & fields */}
      <div className="mt-2 p-2 border rounded bg-gray-50 flex flex-wrap gap-4 items-center">
        <span className="font-semibold text-sm">Select Entire Column:</span>
        {COLLECTION_ACTIONS.map(({ action, label }) => (
          <div
            key={action}
            className="flex items-center gap-1 border p-1 rounded"
          >
            <label className="text-xs font-semibold">{label}</label>
            <input
              type="checkbox"
              onChange={(e) => handleSelectAllColumn(action, e.target.checked)}
            />
          </div>
        ))}
      </div>

      {/* Loop over each collection */}
      {collectionsPermissions.map((colPerm) => {
        const isCollapsed = collapsedMap[colPerm.collectionName] ?? true

        // Fields for this collection
        const fieldsForThisCollection = allCollectionFields.filter(
          (f) => f.collectionName === colPerm.collectionName,
        )

        // Merge existing or default
        const mergedFieldPerms: FieldsPermission[] = fieldsForThisCollection.map(
          (f) => {
            const existing = fieldsPermissions.find(
              (fp) =>
                fp.collectionName === f.collectionName && fp.fieldName === f.fieldName,
            )
            return (
              existing || {
                collectionName: f.collectionName,
                fieldName: f.fieldName,
                read: false,
                create: false,
                update: false,
                delete: false,
              }
            )
          },
        )

        return (
          <div key={colPerm.collectionName} className="border p-4 rounded-md mb-2">
            {/* Collection-level header */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">
                {colPerm.collectionName.toUpperCase()}
              </h3>
              <button
                type="button"
                onClick={() => toggleCollapsed(colPerm.collectionName)}
                className="underline text-sm"
              >
                {isCollapsed ? 'Show Fields' : 'Hide Fields'}
              </button>
            </div>

            {/* Collection-level perms => 4 columns */}
            <div className="flex gap-4 my-2">
              {COLLECTION_ACTIONS.map(({ action, label }) => (
                <label key={action} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={!!colPerm[action]}
                    onChange={(e) =>
                      handleCollectionCheckbox(
                        colPerm.collectionName,
                        action,
                        e.target.checked,
                      )
                    }
                  />
                  {label}
                </label>
              ))}
            </div>

            {/*
              "All Fields in This Collection" => 
              2 checkboxes: 
                [  ✓  ] Read 
                [  ✓  ] Update 
            */}
            {!isCollapsed && fieldsForThisCollection.length > 0 && (
              <div className="mb-2 ml-4 flex items-center gap-4">
                                <span className="text-sm font-semibold">
                                    All fields in {colPerm.collectionName}:
                                </span>
                {FIELD_ACTIONS.map((action) => (
                  <label key={action} className="flex items-center gap-1 border p-1 rounded">
                    <span className="text-xs font-semibold">{action.charAt(0).toUpperCase() + action.slice(1)}</span>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        handleSelectAllFieldsInCollection(
                          colPerm.collectionName,
                          action,
                          e.target.checked,
                        )
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            {/* Field-level perms => read + update */}
            {!isCollapsed && (
              <div className="ml-4 mt-2 space-y-2">
                {mergedFieldPerms.length === 0 && (
                  <div className="text-sm italic text-gray-500">
                    No named fields found for this collection.
                  </div>
                )}

                {mergedFieldPerms.map((fieldObj) => {
                  // "All" row => toggles read + update
                  const allRowChecked = fieldObj.read && fieldObj.update

                  return (
                    <div
                      key={fieldObj.fieldName}
                      className="flex items-center justify-between"
                    >
                                            <span className="text-sm font-medium">
                                                {fieldObj.fieldName}
                                            </span>

                      <div className="flex gap-2">
                        {/* read */}
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!fieldObj.read}
                            onChange={(e) =>
                              handleFieldCheckbox(
                                colPerm.collectionName,
                                fieldObj.fieldName,
                                'read',
                                e.target.checked,
                              )
                            }
                          />
                          Read
                        </label>

                        {/* update */}
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={!!fieldObj.update}
                            onChange={(e) =>
                              handleFieldCheckbox(
                                colPerm.collectionName,
                                fieldObj.fieldName,
                                'update',
                                e.target.checked,
                              )
                            }
                          />
                          Update
                        </label>

                        {/* "All" row => read+update */}
                        <label className="flex items-center gap-1 ml-3 border px-2 py-1 rounded">
                          <span className="text-xs font-semibold">All</span>
                          <input
                            type="checkbox"
                            checked={allRowChecked}
                            onChange={(e) =>
                              handleSelectAllRow(
                                fieldObj.collectionName,
                                fieldObj.fieldName,
                                e.target.checked,
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
