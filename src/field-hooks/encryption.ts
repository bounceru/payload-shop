// field-hooks/encryption.ts
import type { FieldHook } from 'payload'
import { encrypt, decrypt } from '../utilities/crypto'

export const encryptField: FieldHook = ({ value }) => {
  if (typeof value === 'string') {
    return encrypt(value)
  }
  return undefined
}

export const decryptField: FieldHook = ({ value }) => {
  try {
    if (typeof value === 'string') {
      return decrypt(value)
    }
    return value
  } catch (err) {
    return undefined // or handle errors differently
  }
}
