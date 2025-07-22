import SignInForm from '@/app/(dashboard)/dashboard/components/auth/SignInForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | Admin',
  description: 'Login to access the dashboard',
}

export default function SignInPage() {
  return <SignInForm />
}
