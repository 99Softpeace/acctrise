"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName: firstName || undefined, lastName: lastName || undefined })
    });

    const payload = await response.json();
    if (!response.ok) {
      setIsLoading(false);
      setError(payload.error || "Unable to create account.");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false, callbackUrl: "/dashboard" });
    setIsLoading(false);

    if (result?.error) {
      setMessage("Account created. Please sign in to continue.");
      router.push("/auth/login");
      return;
    }

    setMessage("Account created. Opening your dashboard...");
    router.push("/dashboard");
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

      <main className="auth-page">
        <div className="hero-bg hero-bg-one" />
        <div className="hero-bg hero-bg-two" />
        <section className="auth-shell" aria-labelledby="signup-title">
          <div className="auth-copy">
            <span className="badge">Create your Acctrise wallet</span>
            <h1 id="signup-title">Start buying digital services in minutes.</h1>
            <p>
              Open one bright account for social growth, OTP numbers, wallet funding, orders, and reseller-ready services.
            </p>
            <div className="auth-highlights" aria-label="Account highlights">
              <span>Free account</span>
              <span>Secure wallet</span>
              <span>Instant dashboard</span>
            </div>
          </div>

          <form className="auth-form-card" onSubmit={handleSubmit}>
            <div className="auth-form-head">
              <span className="badge light">Join Acctrise</span>
              <h2>Create account</h2>
              <p>Set up your login and we will prepare your wallet automatically.</p>
            </div>

            <div className="auth-two-grid">
              <label className="auth-field" htmlFor="firstName">
                <span>First name</span>
                <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" />
              </label>
              <label className="auth-field" htmlFor="lastName">
                <span>Last name</span>
                <input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" />
              </label>
            </div>

            <label className="auth-field" htmlFor="email">
              <span>Email</span>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
            </label>

            <label className="auth-field" htmlFor="password">
              <span>Password</span>
              <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required />
            </label>

            <label className="auth-field" htmlFor="confirm">
              <span>Confirm password</span>
              <input id="confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat password" required />
            </label>

            <label className="auth-check auth-terms" htmlFor="terms">
              <input id="terms" type="checkbox" required />
              <span>
                I agree to the <Link href={"/terms" as any}>Terms</Link> and <Link href={"/privacy" as any}>Privacy Policy</Link>
              </span>
            </label>

            {error && <p className="auth-alert error">{error}</p>}
            {message && <p className="auth-alert success">{message}</p>}

            <button className="btn btn-primary btn-large auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create free account"}
            </button>

            <p className="auth-switch">
              Already have an account? <Link href="/auth/login">Sign in</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}
