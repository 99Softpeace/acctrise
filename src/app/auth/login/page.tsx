"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard";
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    setMessage("Signed in. Opening your dashboard...");
    router.push((result?.url || callbackUrl) as any);
    router.refresh();
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="acctrise home">
          <img src="/acctrise-logo.jpeg" alt="acctrise" />
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/#services">Services</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="top-actions">
          <Link className="btn btn-soft" href="/auth/login">Login</Link>
          <Link className="btn btn-primary" href="/auth/signup">Get Started</Link>
        </div>
      </header>

      <main className="auth-page auth-login-page">
        <div className="hero-bg hero-bg-one" />
        <div className="hero-bg hero-bg-two" />
        <section className="auth-shell" aria-labelledby="login-title">
          <div className="auth-copy">
            <span className="badge">Welcome back to your growth wallet</span>
            <h1 id="login-title">Sign in and keep every order moving.</h1>
            <p>
              Access your wallet, track orders, rent numbers, and manage digital services from the same bright Acctrise account.
            </p>
            <div className="auth-highlights" aria-label="Account highlights">
              <span>Secure wallet</span>
              <span>Live order status</span>
              <span>Fast checkout</span>
            </div>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <span className="badge light">Account login</span>
              <h2>Welcome back</h2>
              <p>Use your email and password to continue.</p>
            </div>

            <label className="auth-field" htmlFor="email">
              <span>Email</span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="auth-field" htmlFor="password">
              <span>Password</span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </label>

            <div className="auth-row">
              <label className="auth-check">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link href="/auth/forgot-password">Forgot password?</Link>
            </div>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            <button className="btn btn-primary btn-large auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>

            <p className="auth-switch">
              New to Acctrise? <Link href="/auth/signup">Create free account</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
