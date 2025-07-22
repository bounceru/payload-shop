import { useTenant } from '../context/TenantContext'

export default function TenantSelect() {
  const { tenantOptions, selectedTenantId, setSelectedTenantId } = useTenant()

  if (tenantOptions.length <= 1) {
    // If there's only 1 tenant or none, you might hide the select
    return null
  }

  return (
    <select
      value={selectedTenantId ?? ''}
      onChange={(e) => setSelectedTenantId(e.target.value)}
      className="border p-2 rounded"
    >
      <option value="" disabled>
        -- Select Tenant --
      </option>
      {tenantOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
