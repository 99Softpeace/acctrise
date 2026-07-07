"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setError("Missing reset token.");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password })
    });
    const payload = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      setError(payload.error || "Unable to reset password.");
      return;
    }

    setMessage("Password updated. Redirecting to login...");
    window.setTimeout(() => router.push("/auth/login"), 1200);
  }

  return (
    <>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="acctrise home">
          <img src="/acctrise-mark.svg" alt="acctrise" />
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
        <section className="auth-shell" aria-labelledby="reset-title">
          <div className="auth-copy">
            <span className="badge">Choose a new password</span>
            <h1 id="reset-title">Secure your Acctrise account again.</h1>
            <p>
              Set a fresh password so your wallet, orders, OTP inbox, and marketplace access stay protected.
            </p>
            <div className="auth-highlights" aria-label="Reset highlights">
              <span>Encrypted password</span>
              <span>Session protected</span>
              <span>Fast recovery</span>
            </div>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <span className="badge light">Account security</span>
              <h2>Reset password</h2>
              <p>Enter your new password to continue.</p>
            </div>

            <label className="auth-field" htmlFor="password">
              <span>New password</span>
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required />
            </label>

            <label className="auth-field" htmlFor="confirm">
              <span>Confirm password</span>
              <input id="confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat password" required />
            </label>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            <button className="btn btn-primary btn-large auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update password"}
            </button>

            <p className="auth-switch">
              Back to account access? <Link href="/auth/login">Sign in</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
