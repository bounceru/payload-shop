'use server'
import { cookies } from 'next/headers'

export async function getUserMe() {
  const cookieStore = await cookies()
  const token = cookieStore.get('payload-token')?.value
  const user = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })
  return await user.json()
}