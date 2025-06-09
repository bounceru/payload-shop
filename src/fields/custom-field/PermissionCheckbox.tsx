import { PermissionCheckboxProps } from './types'

export function PermissionCheckbox({ checked, action, onChange, label }: PermissionCheckboxProps) {
    return (
        <div className='flex items-center gap-2'>
            <input
                checked={checked}
                onChange={(e) => onChange(action, e)}
                type="checkbox"
                name={action}
                id={`${action}-checkbox`}
            />
            <label htmlFor={`${action}-checkbox`}>{label}</label>
        </div>
    )
} 