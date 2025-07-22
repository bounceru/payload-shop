// File: src/utils/flattenFields.ts
import { Field } from 'payload'

/**
 * Narrow the union so TS knows a field actually has a `name` property.
 */
function hasName(field: Field): field is Field & { name: string } {
  return typeof (field as any).name === 'string'
}

/**
 * Recursively traverse any Payload field type
 * and gather actual named fields (including containers).
 */
export function flattenFields(fields: Field[]): { name: string; type: string }[] {
  const results: { name: string; type: string }[] = []

  fields.forEach((field) => {
    switch (field.type) {
      case 'group':
      case 'collapsible':
        // If the container itself has a name, record it
        if (hasName(field)) {
          results.push({
            name: field.name,
            type: field.type,
          })
        }
        // Then flatten its subfields
        if (field.fields) {
          results.push(...flattenFields(field.fields))
        }
        break

      case 'array':
        // If the array itself has a name, record it
        if (hasName(field)) {
          results.push({
            name: field.name,
            type: 'array',
          })
        }
        // Then flatten its item fields
        if (field.fields) {
          results.push(...flattenFields(field.fields))
        }
        break

      case 'tabs':
        // If the tabs container has a name, record it
        if (hasName(field)) {
          results.push({
            name: field.name,
            type: 'tabs',
          })
        }
        // Then flatten each tab’s fields
        if (field.tabs) {
          field.tabs.forEach((tab) => {
            results.push(...flattenFields(tab.fields))
          })
        }
        break

      default:
        // For normal fields like text, number, select, etc.
        // Only push if it has a `name`.
        if (hasName(field)) {
          results.push({
            name: field.name,
            type: field.type,
          })
        }
        break
    }
  })

  return results
}
