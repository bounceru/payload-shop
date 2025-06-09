'use client'
import React, { useState, useEffect } from 'react'
import { toast, Toaster } from 'sonner'
import { CollectionsTableProps, CollectionPermission, PermissionAction } from './types'
import { saveRole } from './api'
import { PermissionCheckbox } from './PermissionCheckbox'

const PERMISSION_ACTIONS: { action: PermissionAction; label: string }[] = [
    { action: 'read', label: 'Read' },
    { action: 'create', label: 'Create' },
    { action: 'update', label: 'Update' },
    { action: 'delete', label: 'Delete' },
]

export function CollectionsTable({ collectionNames, doc }: CollectionsTableProps) {
    // State
    const [roleName, setRoleName] = useState(doc?.name || '')
    const [initialRoleName] = useState(doc?.name || '')
    const [collectionsPermissionsState, setCollectionsPermissionsState] = useState<CollectionPermission[]>(
        doc?.collections?.length ? doc.collections :
            collectionNames.map((name) => ({
                collectionName: name,
                read: false,
                create: false,
                update: false,
                delete: false,
            }))
    )
    const [initialPermissions] = useState(doc?.collections || [])
    const [isFormChanged, setIsFormChanged] = useState(false)

    // Effects
    useEffect(() => {
        const nameChanged = roleName !== initialRoleName
        const permissionsChanged = JSON.stringify(collectionsPermissionsState) !== JSON.stringify(initialPermissions)
        setIsFormChanged(nameChanged || permissionsChanged)
    }, [roleName, collectionsPermissionsState, initialRoleName, initialPermissions])

    // Handlers
    const handleRoleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRoleName(event.target.value)
    }

    const handleCheckboxChange = (collectionName: string, action: PermissionAction, event: React.ChangeEvent<HTMLInputElement>) => {
        setCollectionsPermissionsState((prev) =>
            prev.map((item) =>
                item.collectionName === collectionName
                    ? { ...item, [action]: event.target.checked }
                    : item
            )
        )
    }

    const handleSave = async () => {
        if (!roleName.trim()) {
            toast.error('Role name is required')
            return
        }
        console.log("LOGGING")
        console.log(doc?.id)
        try {
            await saveRole(doc?.id, {
                name: roleName,
                collections: collectionsPermissionsState
            })
            setIsFormChanged(false)
            setTimeout(() => {
                window.location.replace('/admin/collections/roles')
            }, 1000)
        } catch (error: any) {
            console.log(error)
        }
    }

    return (
        <div className='flex flex-col gap-4 p-32'>
            <Toaster position="top-center" />

            {/* Header */}
            <div className='flex justify-between items-center mb-4'>
                <h1 className='text-2xl font-bold'>Role Permissions</h1>
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

            {/* Role Name Input */}
            <div className='flex flex-col gap-2'>
                <h2>Role Name:</h2>
                <input
                    type="text"
                    value={roleName}
                    onChange={handleRoleNameChange}
                    className='border border-gray-300 rounded-xl p-2 focus-visible:outline-none w-full'
                />
            </div>

            {/* Permissions Section */}
            <div className='flex flex-col gap-2'>
                <h2 className='text-lg font-bold'>Permissions</h2>
                <p className='text-sm text-gray-500'>Select the collections you want to grant permissions for.</p>
            </div>

            {/* Permissions Grid */}
            <div className='flex flex-col gap-2'>
                {collectionsPermissionsState.map((item) => (
                    <div key={item.collectionName} className='flex justify-between items-center'>
                        <h2 className='text-lg font-bold'>{item.collectionName}</h2>
                        <div className='flex gap-2'>
                            {PERMISSION_ACTIONS.map(({ action, label }) => (
                                <PermissionCheckbox
                                    key={action}
                                    checked={Boolean(item[action])}
                                    action={action}
                                    onChange={(action, e) => handleCheckboxChange(item.collectionName, action, e)}
                                    label={label}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CollectionsTable