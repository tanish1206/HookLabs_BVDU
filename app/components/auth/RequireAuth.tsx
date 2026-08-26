'use client'
import { useAuth } from '@/app/components/providers/SupabaseProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirectTo=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8B89A8',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 14,
      }}>
        Loading...
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
