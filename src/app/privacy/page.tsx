import styles from "../legal.module.css";

export default function PrivacyPage() {
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><a className={styles.brand} href="/">Brick Buddy</a><a className={styles.back} href="/">Back to shop</a></div>
    <header className={styles.hero}><span className="eyebrow">Privacy</span><h1>How we use order information.</h1><p>Brick Buddy collects only the information needed to process and communicate about your preorder.</p></header>
    <div className={styles.content}>
      <section><h2>Information we collect</h2><p>When you preorder, we collect the parent or guardian name, email address, mobile number, quantity, fulfillment preference, order details, and payment-related metadata. When you submit payment proof, the uploaded image or PDF and any note you provide are also stored for payment verification.</p></section>
      <section><h2>How we use it</h2><p>We use this information to create and manage your Brick Buddy preorder, verify reservation and balance payments, coordinate fulfillment, prevent overselling, provide customer order tracking, and send order-related updates.</p></section>
      <section><h2>Payment proof</h2><p>Payment proof files are stored privately and are intended only for authorized Brick Buddy order administration. They are not placed in a public file bucket.</p></section>
      <section><h2>Order tracking</h2><p>Customer tracking requires both the Brick Buddy order number and the matching email address used for the preorder. Internal admin notes and private proof-file paths are not shown in customer tracking.</p></section>
      <section><h2>Service providers</h2><p>Brick Buddy uses hosting, database/storage, and optional transactional-email providers to operate the preorder service. These services process information only as needed to provide the website and order workflow.</p></section>
      <section><h2>Questions</h2><p>If you need an order-related correction or have a privacy question, contact Brick Buddy through the same contact channel used for your preorder.</p></section>
    </div>
  </div></main>;
}
