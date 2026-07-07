"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    setMessage("Opening dashboard...");
    router.push((result?.url || callbackUrl) as any);
    router.refresh();
  }

  return (
    <main className="auth-clean-page">
      <Link className="auth-clean-logo" href="/" aria-label="Acctrise home">
        <img src="/acctrise-wordmark.jpeg" alt="Acctrise" />
      </Link>

      <form className="auth-clean-card" onSubmit={handleSubmit}>
        <div className="auth-clean-head">
          <span>Login</span>
          <h1>Access your wallet</h1>
        </div>

        <label className="auth-clean-field" htmlFor="email">
          <span>Email</span>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
        </label>

        <label className="auth-clean-field" htmlFor="password">
          <span>Password</span>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required />
        </label>

        <div className="auth-clean-row">
          <Link href="/auth/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="auth-clean-alert error">{error}</p>}
        {message && <p className="auth-clean-alert success">{message}</p>}

        <button className="auth-clean-submit" type="submit" disabled={isLoading}>{isLoading ? "Signing in..." : "Login"}</button>
        <p className="auth-clean-switch">No account? <Link href="/auth/signup">Sign up</Link></p>
      </form>
    </main>
  );
}