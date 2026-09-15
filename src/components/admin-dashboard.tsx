"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import styles from "./admin.module.css";

type Summary = {
  remainingSlots: number;
  totalActive: number;
  awaitingPayment: number;
  pendingProofs: number;
  inProduction: number;
  balanceDue: number;
  ready: number;
  completed: number;
};
type Order = {
  order_number: string;
  customer_name: string;
  email: string;
  mobile: string;
  quantity: number;
  fulfillment: string;
  total_amount: number;
  status: string;
  created_at: string;
};

export function AdminDashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q = search, s = status) => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams();
      if (q.trim()) query.set("q", q.trim());
      if (s) query.set("status", s);
      const [dashboardResponse, ordersResponse] = await Promise.all([
        fetch("/api/admin/dashboard", { cache: "no-store" }),
        fetch(`/api/admin/orders?${query.toString()}`, { cache: "no-store" }),
      ]);
      if (dashboardResponse.status === 401 || ordersResponse.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!dashboardResponse.ok || !ordersResponse.ok) throw new Error("load");
      const dashboard = (await dashboardResponse.json()) as { summary: Summary };
      const orderData = (await ordersResponse.json()) as { orders: Order[] };
      setSummary(dashboard.summary);
      setOrders(orderData.orders);
    } catch {
      setError("Unable to load the admin workspace.");
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => { void load("", ""); }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.assign("/admin/login");
  }

  function submitFilters(event: FormEvent) {
    event.preventDefault();
    void load();
  }

  const stats = summary ? [
    ["Remaining slots", summary.remainingSlots],
    ["Active orders", summary.totalActive],
    ["Awaiting payment", summary.awaitingPayment],
    ["Proofs to review", summary.pendingProofs],
    ["In production", summary.inProduction],
    ["Balance due", summary.balanceDue],
    ["Ready / shipped", summary.ready],
    ["Completed", summary.completed],
  ] : [];

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.topbar}>
          <div><div className={styles.brand}>Brick Buddy Admin</div><div className={styles.muted}>Season 2 launch operations</div></div>
          <button className={styles.buttonAlt} onClick={logout}>Sign out</button>
        </header>
        {error ? <div className={styles.error} role="alert">{error}</div> : null}
        <section className={styles.stats} aria-label="Order summary">
          {stats.map(([label, value]) => <div className={styles.stat} key={String(label)}><strong>{value}</strong><span>{label}</span></div>)}
        </section>
        <section className={styles.card}>
          <form className={styles.tools} onSubmit={submitFilters}>
            <input className={styles.input} placeholder="Order, customer, email or mobile" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search orders" />
            <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
              <option value="">All statuses</option>
              <option value="awaiting_payment">Awaiting payment</option><option value="reserved">Reserved</option><option value="materials_secured">Materials secured</option><option value="building_qc">Building / QC</option><option value="balance_due">Balance due</option><option value="ready">Ready</option><option value="shipped">Shipped</option><option value="completed">Completed</option><option value="expired">Expired</option><option value="cancelled">Cancelled</option>
            </select>
            <button className={styles.button} type="submit">Apply</button>
          </form>
          {loading ? <div className={styles.empty}>Loading orders…</div> : orders.length === 0 ? <div className={styles.empty}>No orders match this view.</div> : (
            <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Order</th><th>Customer</th><th>Qty</th><th>Status</th><th>Total</th><th>Created</th></tr></thead><tbody>{orders.map((order) => <tr key={order.order_number}><td><a className={styles.orderLink} href={`/admin/orders/${encodeURIComponent(order.order_number)}`}>{order.order_number}</a></td><td><strong>{order.customer_name}</strong><br /><span className={styles.muted}>{order.email}</span></td><td>{order.quantity}</td><td><span className={styles.badge}>{order.status.replaceAll("_", " ")}</span></td><td>₱{order.total_amount.toLocaleString()}</td><td>{new Date(order.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>
          )}
        </section>
      </div>
    </div>
  );
}
