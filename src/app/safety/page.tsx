import styles from "../legal.module.css";

export default function SafetyPage() {
  return <main className={styles.page}><div className={styles.wrap}>
    <div className={styles.top}><a className={styles.brand} href="/">Brick Buddy</a><a className={styles.back} href="/">Back to shop</a></div>
    <header className={styles.hero}><span className="eyebrow">Safety & independence</span><h1>Built for creative play, with small parts.</h1><p>Please use Brick Buddy with age-appropriate supervision and keep small pieces away from younger children.</p></header>
    <div className={styles.notice}>Contains small parts. Not suitable for children under 3 years. Adult supervision recommended.</div>
    <div className={styles.content}>
      <section><h2>Small-parts safety</h2><p>Brick Buddy contains small building pieces and a character figure that can present a choking hazard. Keep components away from children under 3 and supervise play as appropriate for the child.</p></section>
      <section><h2>Before play</h2><p>Check the case and pieces periodically for damage. Stop using any component that becomes cracked, sharp, or otherwise unsafe.</p></section>
      <section><h2>Independent product</h2><p>Brick Buddy is an independent creative-play product. It is not affiliated with, authorized by, sponsored by, or endorsed by the LEGO Group.</p></section>
      <section><h2>Third-party pieces</h2><p>Where genuine LEGO® elements are included, they are used as components in an independently assembled Brick Buddy product. LEGO® is a trademark of the LEGO Group, which does not sponsor, authorize, or endorse Brick Buddy.</p></section>
    </div>
  </div></main>;
}
