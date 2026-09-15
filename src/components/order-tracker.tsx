"use client";

import { FormEvent, useState } from "react";
import styles from "./order-tracker.module.css";

type CustomerOrder = {
  orderNumber: string;
  quantity: number;
  fulfillment: string;
  totalAmount: number;
  reservationTotal: number;
  balanceTotal: number;
  status: string;
  holdExpiresAt: string;
  payments: { reservation: string; balance: string };
  events: Array<{ type: string; title: string; message: string | null; status: string | null; createdAt: string }>;
};

function friendlyStatus(status: string) {
  const labels: Record<string, string> = {
    awaiting_payment: "Awaiting reservation payment",
    reserved: "Reserved",
    materials_secured: "Materials secured",
    building_qc: "Building / quality check",
    balance_due: "Balance due",
    ready: "Ready",
    shipped: "Shipped",
    completed: "Completed",
    expired: "Expired",
    cancelled: "Cancelled",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [kind, setKind] = useState<"reservation" | "balance">("reservation");

  async function lookup(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const body = await response.json().catch(() => ({})) as { order?: CustomerOrder; error?: string };
      if (!response.ok || !body.order) { setOrder(null); setError(body.error ?? "We couldn't verify that order."); return; }
      setOrder(body.order);
      if (body.order.status === "balance_due") setKind("balance"); else setKind("reservation");
    } catch { setError("Unable to check your order right now."); }
    finally { setLoading(false); }
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("orderNumber", orderNumber.trim());
    formData.set("email", email.trim());
    formData.set("kind", kind);
    setUploading(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/orders/payment-proof", { method: "POST", body: formData });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) { setError(body.error ?? "We couldn't upload your proof."); return; }
      setNotice("Payment proof uploaded. We'll review it before confirming payment.");
      form.reset();
      await lookup();
    } catch { setError("We couldn't upload your proof. Please try again."); }
    finally { setUploading(false); }
  }

  const canReservation = order?.status === "awaiting_payment" && ["not_submitted", "rejected"].includes(order.payments.reservation);
  const canBalance = order?.status === "balance_due" && ["not_submitted", "rejected"].includes(order.payments.balance);
  const showUpload = Boolean(canReservation || canBalance);
  const expected = kind === "reservation" ? order?.reservationTotal ?? 0 : order?.balanceTotal ?? 0;

  return (
    <div className="tracker-card">
      <span className="eyebrow">Track your preorder</span>
      <h3>Order status</h3>
      <p>Use your order number and the same email you used when reserving.</p>
      <form className={styles.form} onSubmit={lookup}>
        <label className={styles.label}>Order number<input className={styles.input} placeholder="BB-S2-001" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} autoCapitalize="characters" required /></label>
        <label className={styles.label}>Email<input className={styles.input} type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <button className={styles.button} disabled={loading} type="submit">{loading ? "Checking…" : "Track order"}</button>
      </form>
      {error ? <div className={styles.error} role="alert">{error}</div> : null}
      {notice ? <div className={styles.notice} role="status">{notice}</div> : null}

      {order ? <div className={styles.summary}>
        <div className={styles.header}><div><div className={styles.orderNo}>{order.orderNumber}</div><div className={styles.hint}>{order.quantity} unit{order.quantity > 1 ? "s" : ""} • {order.fulfillment}</div></div><span className={styles.status}>{friendlyStatus(order.status)}</span></div>
        <div className={styles.totals}><div className={styles.total}><strong>₱{order.totalAmount.toLocaleString()}</strong><span>Order total</span></div><div className={styles.total}><strong>₱{order.reservationTotal.toLocaleString()}</strong><span>Reservation</span></div><div className={styles.total}><strong>₱{order.balanceTotal.toLocaleString()}</strong><span>Balance</span></div></div>
        <div className={styles.paymentGrid}><div className={styles.payment}><strong>Reservation payment</strong><small>{order.payments.reservation.replaceAll("_", " ")}</small></div><div className={styles.payment}><strong>Balance payment</strong><small>{order.payments.balance.replaceAll("_", " ")}</small></div></div>
        {order.status === "awaiting_payment" ? <p className={styles.hint}>Your slot is held until {new Date(order.holdExpiresAt).toLocaleString()} while reservation payment is pending.</p> : null}
        <div className={styles.timeline}>{order.events.length === 0 ? <div className={styles.hint}>Your timeline will appear here as your order moves forward.</div> : order.events.map((item, index) => <div className={styles.event} key={`${item.createdAt}-${index}`}><strong>{item.title}</strong>{item.message ? <div>{item.message}</div> : null}<small>{new Date(item.createdAt).toLocaleString()}</small></div>)}</div>

        {showUpload ? <form className={styles.upload} onSubmit={upload}>
          <h4>Upload payment proof</h4><p className={styles.hint}>JPG, PNG, WebP, or PDF up to 5 MB. Submitting proof does not mark payment approved until Brick Buddy verifies it.</p>
          {canReservation && canBalance ? <label className={styles.label}>Payment type<select className={styles.select} value={kind} onChange={(e) => setKind(e.target.value as "reservation" | "balance")}><option value="reservation">Reservation</option><option value="balance">Balance</option></select></label> : null}
          <div className={styles.two}><label className={styles.label}>Amount paid<input className={styles.input} name="amount" inputMode="numeric" type="number" min="0" max="1000000" defaultValue={expected} required /></label><label className={styles.label}>Proof file<input className={styles.file} name="proof" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required /></label></div>
          <label className={styles.label}>Note (optional)<textarea className={styles.textarea} name="note" maxLength={500} placeholder="Reference number or anything we should know" /></label>
          <input type="hidden" name="kind" value={kind} />
          <button className={styles.button} disabled={uploading} type="submit">{uploading ? "Uploading…" : `Submit ${kind} proof`}</button>
        </form> : null}
      </div> : null}
    </div>
  );
}
