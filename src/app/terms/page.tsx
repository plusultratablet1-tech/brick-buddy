import styles from "../legal.module.css";

export default function TermsPage() {
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><a className={styles.brand} href="/">Brick Buddy</a><a className={styles.back} href="/">Back to shop</a></div>
    <header className={styles.hero}><span className="eyebrow">Preorder terms</span><h1>Simple small-batch rules.</h1><p>These terms explain the current Brick Buddy Season 2 preorder process.</p></header>
    <div className={styles.notice}>Season 2: ₱449 total per unit • ₱200 reservation per unit • ₱249 remaining balance per unit.</div>
    <div className={styles.content}>
      <section><h2>Reservation and hold</h2><p>Creating an order holds the requested launch slots for 24 hours while the ₱200-per-unit reservation payment is pending. If the reservation is not confirmed within the hold window, an unpaid order may expire and its slots may return to the batch.</p></section>
      <section><h2>Payment verification</h2><p>Uploading payment proof does not automatically mean payment is approved. Brick Buddy reviews submitted proof before marking the reservation or balance as confirmed.</p></section>
      <section><h2>Remaining balance</h2><p>The remaining ₱249 per unit becomes due before fulfillment at the balance-due stage. Balance proof is also subject to verification.</p></section>
      <section><h2>Small-batch timing</h2><p>Brick Buddy is prepared in small batches. Any stated preparation estimate is a target and can change depending on material arrival, assembly, quality checks, and fulfillment coordination.</p></section>
      <section><h2>Fulfillment</h2><p>Your selected shipping or meet-up preference is recorded with the order. Final fulfillment details are coordinated as the order reaches the ready stage.</p></section>
      <section><h2>Order updates</h2><p>Keep your Brick Buddy order number. You can use it with the matching preorder email to view customer-visible status updates and submit payment proof when required.</p></section>
    </div>
  </div></main>;
}
