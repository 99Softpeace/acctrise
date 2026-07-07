"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, type FormEvent } from "react";

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
      setMessage("Account created. Please login.");
      router.push("/auth/login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="auth-clean-page">
      <Link className="auth-clean-logo" href="/" aria-label="Acctrise home">
        <img src="/acctrise-wordmark.jpeg" alt="Acctrise" />
      </Link>

      <form className="auth-clean-card auth-clean-card-wide" onSubmit={handleSubmit}>
        <div className="auth-clean-head">
          <span>Sign up</span>
          <h1>Create your wallet</h1>
        </div>

        <div className="auth-clean-two">
          <label className="auth-clean-field" htmlFor="firstName">
            <span>First name</span>
            <input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} placeholder="First name" />
          </label>
          <label className="auth-clean-field" htmlFor="lastName">
            <span>Last name</span>
            <input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} placeholder="Last name" />
          </label>
        </div>

        <label className="auth-clean-field" htmlFor="email">
          <span>Email</span>
          <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
        </label>

        <label className="auth-clean-field" htmlFor="password">
          <span>Password</span>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" required />
        </label>

        <label className="auth-clean-field" htmlFor="confirm">
          <span>Confirm password</span>
          <input id="confirm" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat password" required />
        </label>

        {error && <p className="auth-clean-alert error">{error}</p>}
        {message && <p className="auth-clean-alert success">{message}</p>}

        <button className="auth-clean-submit" type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Sign up"}</button>
        <p className="auth-clean-switch">Have an account? <Link href="/auth/login">Login</Link></p>
      </form>
    </main>
  );
}