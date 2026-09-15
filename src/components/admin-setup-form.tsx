"use client";

import { FormEvent, useState } from "react";
import styles from "./admin.module.css";

export function AdminSetupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(body?.error ?? "Unable to create the admin account.");
        return;
      }
      window.location.assign("/admin/login");
    } catch {
      setError("Unable to create the admin account right now.");
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
        <input className={styles.input} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
      </label>
      <label className={styles.label}>
        Confirm password
        <input className={styles.input} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} required />
      </label>
      <p className={styles.muted}>Use a unique password. It stays between your browser and Supabase Auth and is never committed to the project.</p>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      <button className={styles.button} disabled={loading} type="submit">{loading ? "Creating admin…" : "Create Brick Buddy admin"}</button>
    </form>
  );
}
