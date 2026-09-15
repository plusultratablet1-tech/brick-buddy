"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./admin.module.css";

type Payment = {
  id: string;
  kind: string;
  expected_amount: number;
  submitted_amount: number | null;
  status: string;
  proof_original_name: string;
  proof_mime_type: string;
  customer_note: string | null;
  admin_note: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  proofUrl: string | null;
};
type Event = { id: string; title: string; message: string | null; created_at: string; actor_type: string; customer_visible: boolean };
type Notification = { id: string; template: string; status: string; attempt_count: number; last_error: string | null; created_at: string };
type Detail = {
  order: {
    order_number: string; customer_name: string; email: string; mobile: string; quantity: number; fulfillment: string;
    total_amount: number; reservation_total: number; balance_total: number; status: string; hold_expires_at: string; created_at: string;
  };
  payments: Payment[];
  events: Event[];
  notifications: Notification[];
  allowedTransitions: string[];
};

export function AdminOrderDetail({ orderNumber }: { orderNumber: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}`, { cache: "no-store" });
      if (response.status === 401) { window.location.assign("/admin/login"); return; }
      if (!response.ok) throw new Error("load");
      setDetail(await response.json() as Detail);
    } catch {
      setError("Unable to load this order.");
    }
  }, [orderNumber]);

  useEffect(() => { void load(); }, [load]);

  async function review(paymentId: string, action: "approved" | "rejected") {
    const adminNote = window.prompt(action === "approved" ? "Optional verification note" : "Reason / note for rejection") ?? "";
    setBusy(`payment-${paymentId}`);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/payments/${encodeURIComponent(paymentId)}/review`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, adminNote }),
      });
      if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error ?? "Payment review failed."); }
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Payment review failed."); }
    finally { setBusy(""); }
  }

  async function transition(toStatus: string) {
    setBusy(`status-${toStatus}`); setError("");
    try {
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderNumber)}/status`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ toStatus, message: message.trim() || undefined }),
      });
      if (!response.ok) { const body = await response.json().catch(() => ({})) as { error?: string }; throw new Error(body.error ?? "Status update failed."); }
      setMessage(""); await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Status update failed."); }
    finally { setBusy(""); }
  }

  async function retry(notificationId: string) {
    setBusy(`notification-${notificationId}`); setError("");
    try {
      const response = await fetch(`/api/admin/notifications/${encodeURIComponent(notificationId)}/retry`, { method: "POST" });
      if (!response.ok) throw new Error("Notification retry failed.");
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Notification retry failed."); }
    finally { setBusy(""); }
  }

  if (!detail) return <div className={styles.page}><div className={styles.shell}><a href="/admin">← Back to orders</a>{error ? <div className={styles.error}>{error}</div> : <div className={styles.empty}>Loading order…</div>}</div></div>;
  const o = detail.order;

  return <div className={styles.page}><div className={styles.shell}>
    <header className={styles.topbar}><div><a href="/admin">← All orders</a><div className={styles.brand}>{o.order_number}</div><span className={styles.badge}>{o.status.replaceAll("_", " ")}</span></div><div><strong>₱{o.total_amount.toLocaleString()}</strong><div className={styles.muted}>{o.quantity} unit{o.quantity > 1 ? "s" : ""}</div></div></header>
    {error ? <div className={styles.error} role="alert">{error}</div> : null}
    <div className={styles.grid}>
      <div>
        <section className={`${styles.card} ${styles.section}`}><h2>Customer & order</h2><div className={styles.kv}>
          <span>Name</span><strong>{o.customer_name}</strong><span>Email</span><span>{o.email}</span><span>Mobile</span><span>{o.mobile}</span><span>Fulfillment</span><span>{o.fulfillment}</span><span>Reservation</span><span>₱{o.reservation_total.toLocaleString()}</span><span>Balance</span><span>₱{o.balance_total.toLocaleString()}</span><span>Hold deadline</span><span>{new Date(o.hold_expires_at).toLocaleString()}</span>
        </div></section>
        <section className={`${styles.card} ${styles.section}`}><h2>Payments</h2>{detail.payments.length === 0 ? <div className={styles.empty}>No payment proof submitted.</div> : detail.payments.map((payment) => <div className={styles.item} key={payment.id}><div className={styles.row}><div><strong>{payment.kind === "reservation" ? "Reservation" : "Balance"} proof</strong><div className={styles.muted}>{payment.status} • expected ₱{payment.expected_amount.toLocaleString()}{payment.submitted_amount != null ? ` • submitted ₱${payment.submitted_amount.toLocaleString()}` : ""}</div></div>{payment.proofUrl ? <a className={styles.buttonAlt} href={payment.proofUrl} target="_blank" rel="noreferrer">View proof</a> : null}</div>{payment.customer_note ? <p>Customer note: {payment.customer_note}</p> : null}{payment.admin_note ? <p className={styles.muted}>Admin note: {payment.admin_note}</p> : null}{payment.status === "pending" ? <div className={styles.actions}><button className={styles.button} disabled={busy === `payment-${payment.id}`} onClick={() => void review(payment.id, "approved")}>Approve</button><button className={`${styles.button} ${styles.danger}`} disabled={busy === `payment-${payment.id}`} onClick={() => void review(payment.id, "rejected")}>Reject</button></div> : null}</div>)}</section>
      </div>
      <div>
        <section className={`${styles.card} ${styles.section}`}><h2>Move order forward</h2>{detail.allowedTransitions.length === 0 ? <div className={styles.empty}>No further status actions.</div> : <><label className={styles.label}>Customer-visible update note<textarea className={styles.textarea} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Optional note shown in tracking" /></label><div className={styles.actions}>{detail.allowedTransitions.map((status) => <button key={status} className={status === "cancelled" ? `${styles.button} ${styles.danger}` : styles.button} disabled={Boolean(busy)} onClick={() => void transition(status)}>{status === "cancelled" ? "Cancel order" : `Mark ${status.replaceAll("_", " ")}`}</button>)}</div></>}</section>
        <section className={`${styles.card} ${styles.section}`}><h2>Timeline</h2><div className={styles.timeline}>{detail.events.length === 0 ? <div className={styles.empty}>No events yet.</div> : detail.events.map((event) => <div className={styles.timelineItem} key={event.id}><strong>{event.title}</strong>{event.message ? <div>{event.message}</div> : null}<small>{new Date(event.created_at).toLocaleString()} • {event.actor_type}{event.customer_visible ? " • visible to customer" : ""}</small></div>)}</div></section>
        <section className={`${styles.card} ${styles.section}`}><h2>Email outbox</h2>{detail.notifications.length === 0 ? <div className={styles.empty}>No notifications yet.</div> : detail.notifications.map((item) => <div className={styles.item} key={item.id}><div className={styles.row}><div><strong>{item.template.replaceAll("_", " ")}</strong><div className={styles.muted}>{item.status} • attempts {item.attempt_count}</div>{item.last_error ? <div className={styles.muted}>{item.last_error}</div> : null}</div>{item.status !== "sent" ? <button className={styles.buttonAlt} disabled={busy === `notification-${item.id}`} onClick={() => void retry(item.id)}>Retry</button> : null}</div></div>)}</section>
      </div>
    </div>
  </div></div>;
}
