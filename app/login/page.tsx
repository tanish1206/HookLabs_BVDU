"use client";
import { useEffect, useState } from "react";
import { Button, ErrorMessage } from "@/app/components/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/components/providers/SupabaseProvider";
import { Suspense } from "react";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const redirectTo = searchParams?.get("redirectTo") || "/pipeline";
      router.push(redirectTo);
    }
  }, [user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/pipeline");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <div style={{ width: 360, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: 32, boxShadow: "var(--shadow-lg)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-md)", margin: "0 auto 16px",
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "var(--shadow-accent)",
          }}>
            ⚡
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Sign in to start creating</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Generate viral scripts, voiceovers and videos automatically.</p>
        </div>

        {error && <div style={{ marginBottom: 16 }}><ErrorMessage message={error} /></div>}

        <Button 
          variant="secondary" 
          onClick={async () => {
             const { createClient } = await import("@/lib/supabase/client");
             const supabase = createClient();
             supabase.auth.signInWithOAuth({ 
               provider: 'google',
               options: { redirectTo: `${window.location.origin}/auth/callback` }
             });
          }}
          style={{ width: "100%", justifyContent: "center", marginBottom: 16, background: "white", color: "black" }}
        >
          <img src="https://www.google.com/favicon.ico" width={16} height={16} alt="Google" style={{ marginRight: 8 }} />
          Continue with Google
        </Button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0", color: "var(--muted2)", fontSize: 12, fontFamily: "var(--font-mono)" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          or continue with email
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>EMAIL</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="creator@example.com" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>PASSWORD</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
            Sign In
          </Button>
        </form>

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
          <Link href="/auth/reset-password" style={{ color: "var(--muted)", marginBottom: 12, display: "block", textDecoration: "none" }}>Forgot password?</Link>
          Don't have an account? <Link href="/signup" style={{ color: "var(--accent)" }}>Sign up →</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
