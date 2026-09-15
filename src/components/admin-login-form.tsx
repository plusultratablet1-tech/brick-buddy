"use client";

import { FormEvent, useState } from "react";
import styles from "./admin.module.css";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Unable to sign in.");
        return;
      }
      window.location.assign("/admin");
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <label className={styles.label}>
        Admin email
        <input className={styles.input} type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label className={styles.label}>
        Password
        <input className={styles.input} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      </label>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      <button className={styles.button} disabled={loading} type="submit">{loading ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
