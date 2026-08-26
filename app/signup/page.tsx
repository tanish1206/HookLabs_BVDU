// app/signup/page.tsx
"use client";

import { useState } from "react";
import { Button, ErrorMessage } from "@/app/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) throw error;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800 }}>Create your account</h1>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 4 }}>Start with 3 free videos per month. No credit card.</p>
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

        {success ? (
          <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: 16, borderRadius: "var(--radius-md)", color: "var(--green)", fontSize: 13, textAlign: "center" }}>
            Success! Please check your email to confirm your account.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>EMAIL</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="creator@example.com" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--muted)", marginBottom: 6 }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6} />
            </div>
            <Button type="submit" loading={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
              Create Account
            </Button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--muted)" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent)" }}>Sign in →</Link>
          <div style={{ marginTop: 16, fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--muted2)" }}>
            By signing up you agree to our Terms and Privacy Policy
          </div>
        </div>
      </div>
    </div>
  );
}
