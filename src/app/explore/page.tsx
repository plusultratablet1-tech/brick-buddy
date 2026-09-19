import type { Metadata } from "next";
import styles from "./explore.module.css";

export const metadata: Metadata = {
  title: { absolute: "Explore Brick Buddy | Bring • Build • Bond" },
  description: "Explore more ways to play with Brick Buddy — build ideas, Buddy challenges, parent-child prompts, and portable play inspiration.",
};

const exploreCards = [
  {
    eyebrow: "Build",
    title: "Build Ideas",
    text: "Follow simple starter builds, then remix them into something completely your own.",
    href: "/build-ideas",
    cta: "See build ideas →",
  },
  {
    eyebrow: "Bond",
    title: "Build Together",
    text: "Use quick prompts and mini challenges to turn a few waiting minutes into time spent making something together.",
    href: "/build-ideas#quick-builds",
    cta: "Try a challenge →",
  },
  {
    eyebrow: "Buddy",
    title: "Play With Your Surprise Buddy",
    text: "Build a chair, home, tower, stage, hideout, or anything else your Buddy might need today.",
    href: "/build-ideas",
    cta: "Find Buddy ideas →",
  },
  {
    eyebrow: "Bring",
    title: "Take It Anywhere",
    text: "Restaurants, appointments, trips, visits, or any little pocket of time that could use a creative activity.",
    href: "/#meet",
    cta: "Meet Brick Buddy →",
  },
];

export default function ExplorePage() {
  return (
    <main className={styles.page}>
      <div className={styles.announcement}>
        <span>Explore Brick Buddy • Play beyond the box</span>
        <strong>BUILD • BOND • BRING</strong>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Brick Buddy home">
          <span className={styles.brandMark}>B</span>
          <span>Brick Buddy</span>
        </a>
        <nav className={styles.nav} aria-label="Explore navigation">
          <a href="/#meet">Meet Brick Buddy</a>
          <a href="/#inside">What&apos;s inside</a>
          <a href="/build-ideas">Build ideas</a>
          <a className={styles.active} href="/explore">Explore</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <a className={styles.headerCta} href="/#preorder">Preorder</a>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>Explore Brick Buddy</span>
        <h1>There&apos;s more to do than just follow the instructions.</h1>
        <p>
          Brick Buddy is meant to be reopened, rebuilt, shared, and brought along.
          Start with a build idea, try a challenge, make something for your Surprise Buddy,
          or invent your own way to play together.
        </p>
        <div className={styles.slogan}>BUILD • BOND • BRING</div>
      </section>

      <section className={styles.grid} aria-label="Ways to explore Brick Buddy">
        {exploreCards.map((card) => (
          <article className={styles.card} key={card.title}>
            <span>{card.eyebrow}</span>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
            <a href={card.href}>{card.cta}</a>
          </article>
        ))}
      </section>

      <section className={styles.ideaSection}>
        <div>
          <span className={styles.eyebrow}>A growing Brick Buddy space</span>
          <h2>New ideas can live here.</h2>
        </div>
        <p>
          This page can grow with Brick Buddy — seasonal mini builds, customer creations,
          parent-child challenges, printable prompts, new Buddy stories, and more.
          The QR code can still send owners directly to Build Ideas, while anyone browsing
          the website can use Explore as the bigger activity hub.
        </p>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrowLight}>Ready to make something?</span>
          <h2>Pick a build and start there.</h2>
          <p>No need to build it exactly the same. Change it, rebuild it, and make it yours.</p>
        </div>
        <a href="/build-ideas">Explore Build Ideas →</a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <a className={styles.brand} href="/">
            <span className={styles.brandMark}>B</span>
            <span>Brick Buddy</span>
          </a>
          <p>Build • Bond • Bring</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="/#meet">Product story</a>
          <a href="/build-ideas">Build ideas</a>
          <a href="/explore">Explore</a>
          <a href="/#preorder">Preorder & tracking</a>
          <a href="/#faq">FAQ</a>
        </div>
        <div className={styles.footerLegal}>
          <p>Brick Buddy is an independent creative-play product and is not affiliated with, authorized by, sponsored by, or endorsed by the LEGO Group.</p>
          <p><strong>Safety:</strong> Contains small parts. Not suitable for children under 3 years. Adult supervision recommended.</p>
          <p>© 2026 Brick Buddy. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
