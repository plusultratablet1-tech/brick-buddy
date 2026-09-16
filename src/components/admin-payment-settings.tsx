"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./admin.module.css";

type AdminPaymentSettings = {
  method: string;
  accountName: string;
  accountNumber: string;
  instructions: string;
  isActive: boolean;
  updatedAt: string | null;
};

const EMPTY_SETTINGS: AdminPaymentSettings = {
  method: "GCash",
  accountName: "",
  accountNumber: "",
  instructions: "",
  isActive: false,
  updatedAt: null,
};

export function AdminPaymentSettingsPanel() {
  const [settings, setSettings] = useState<AdminPaymentSettings>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/api/admin/payment-settings", { cache: "no-store" });
        if (response.status === 401) {
          window.location.assign("/admin/login");
          return;
        }
        const body = await response.json().catch(() => ({})) as {
          settings?: AdminPaymentSettings;
          error?: string;
        };
        if (!response.ok || !body.settings) throw new Error("load");
        if (active) setSettings(body.settings);
      } catch {
        if (active) setError("Unable to load payment settings.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/payment-settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          method: settings.method,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          instructions: settings.instructions,
          isActive: settings.isActive,
        }),
      });

      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }

      const body = await response.json().catch(() => ({})) as {
        settings?: AdminPaymentSettings;
        error?: string;
      };

      if (!response.ok || !body.settings) {
        setError(body.error ?? "Unable to save payment settings.");
        return;
      }

      setSettings(body.settings);
      setSuccess(body.settings.isActive
        ? "Payment instructions are active for customers."
        : "Payment settings saved. Customer instructions remain inactive.");
    } catch {
      setError("Unable to save payment settings.");
    } finally {
      setSaving(false);
    }
  }

  const configured = Boolean(settings.accountName.trim() && settings.accountNumber.trim());
  const statusLabel = settings.isActive ? "Active" : configured ? "Inactive" : "Not configured";

  return (
    <section className={`${styles.card} ${styles.paymentSettingsCard}`}>
      <div className={styles.paymentSettingsHeader}>
        <div>
          <div className={styles.sectionEyebrow}>Customer payments</div>
          <h2>Payment settings</h2>
          <p className={styles.muted}>These are the customer-facing details shown only when payment is due.</p>
        </div>
        <span className={settings.isActive ? styles.badgeActive : styles.badgeMuted}>{statusLabel}</span>
      </div>

      {loading ? <div className={styles.empty}>Loading payment settings…</div> : (
        <form onSubmit={save}>
          <div className={styles.paymentSettingsGrid}>
            <label className={styles.label}>
              Payment method
              <input
                className={styles.input}
                value={settings.method}
                maxLength={40}
                onChange={(event) => setSettings((current) => ({ ...current, method: event.target.value }))}
                placeholder="GCash"
                required
              />
            </label>
            <label className={styles.label}>
              Account name
              <input
                className={styles.input}
                value={settings.accountName}
                maxLength={120}
                onChange={(event) => setSettings((current) => ({ ...current, accountName: event.target.value }))}
                placeholder="Customer-visible account name"
              />
            </label>
            <label className={styles.label}>
              Account number
              <input
                className={styles.input}
                value={settings.accountNumber}
                maxLength={64}
                onChange={(event) => setSettings((current) => ({ ...current, accountNumber: event.target.value }))}
                placeholder="09xx xxx xxxx"
                inputMode="tel"
              />
            </label>
            <label className={`${styles.label} ${styles.paymentInstructionsField}`}>
              Customer instructions (optional)
              <textarea
                className={styles.textarea}
                value={settings.instructions}
                maxLength={500}
                onChange={(event) => setSettings((current) => ({ ...current, instructions: event.target.value }))}
                placeholder="Example: Include your Brick Buddy order number in the note."
              />
            </label>
          </div>

          <label className={styles.toggleRow}>
            <input
              type="checkbox"
              checked={settings.isActive}
              onChange={(event) => setSettings((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span><strong>Active</strong><small>Show these payment instructions to customers when a payment is due.</small></span>
          </label>

          {settings.updatedAt ? <p className={styles.muted}>Last updated {new Date(settings.updatedAt).toLocaleString("en-PH")}</p> : null}
          {error ? <div className={styles.error} role="alert">{error}</div> : null}
          {success ? <div className={styles.success} role="status">{success}</div> : null}

          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save payment settings"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
