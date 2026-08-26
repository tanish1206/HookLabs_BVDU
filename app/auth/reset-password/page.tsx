'use client'

import { useState } from 'react'
import { Button, ErrorMessage } from '@/app/components/ui'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      })
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 20 }}>
      <div style={{ width: 360, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 32, boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 'var(--radius-md)', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: 'var(--shadow-accent)',
          }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>Reset Password</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Enter your email to receive a reset link</p>
        </div>

        {error && <div style={{ marginBottom: 16 }}><ErrorMessage message={error} /></div>}

        {success ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: 16, borderRadius: 'var(--radius-md)', color: 'var(--green)', fontSize: 13, textAlign: 'center' }}>
            Check your inbox. We've sent you a reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginBottom: 6 }}>EMAIL</label>
              <input type='email' required value={email} onChange={e => setEmail(e.target.value)} placeholder='creator@example.com' />
            </div>
            <Button type='submit' loading={loading} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              Send reset link
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
