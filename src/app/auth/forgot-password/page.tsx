"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });

    setIsLoading(false);
    if (!response.ok) {
      setError("Unable to send reset instructions right now.");
      return;
    }

    setMessage("If the email exists, reset instructions have been sent.");
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

      <main className="auth-page">
        <div className="hero-bg hero-bg-one" />
        <div className="hero-bg hero-bg-two" />
        <section className="auth-shell" aria-labelledby="forgot-title">
          <div className="auth-copy">
            <span className="badge">Recover your account</span>
            <h1 id="forgot-title">Get back to your Acctrise wallet safely.</h1>
            <p>
              Enter the email connected to your account and we will send a secure reset link if that account exists.
            </p>
            <div className="auth-highlights" aria-label="Account recovery highlights">
              <span>Secure reset link</span>
              <span>30 minute expiry</span>
              <span>Wallet protected</span>
            </div>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <span className="badge light">Password reset</span>
              <h2>Forgot password?</h2>
              <p>We will send reset instructions to your email.</p>
            </div>

            <label className="auth-field" htmlFor="email">
              <span>Email</span>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            <button className="btn btn-primary btn-large auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send reset link"}
            </button>

            <p className="auth-switch">
              Remembered it? <Link href="/auth/login">Back to login</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
