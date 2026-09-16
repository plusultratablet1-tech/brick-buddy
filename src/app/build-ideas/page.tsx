import type { Metadata } from "next";
import { BuildIdeaVisual } from "../../components/build-idea-visual";
import { brickBuddyInventory, buildIdeas } from "../../lib/build-ideas";
import styles from "./build-ideas.module.css";

export const metadata: Metadata = {
  title: { absolute: "Brick Buddy Build Ideas | Bring • Build • Bond" },
  description: "Simple Brick Buddy build ideas, Buddy challenges, and screen-free activities using the pieces included in your Brick Buddy.",
};

const buddyPrompts = [
  "Chair",
  "Tiny bed",
  "Table",
  "Lookout tower",
  "Doorway or gate",
  "Stage",
  "Throne",
  "Secret base",
];

const challenges = [
  ["The Tallest Challenge", "Use every brick and build as high as you can."],
  ["The Strongest Challenge", "Build something that stays standing when you gently move the plate."],
  ["The Six-Color Challenge", "Create a pattern where every color has its own place."],
  ["The Buddy Home Challenge", "Build somewhere your Surprise Buddy would want to live."],
  ["The 5-Minute Challenge", "Set a timer and build anything you can before time runs out."],
  ["The Copy Me Challenge", "One person builds something. The other person tries to recreate it."],
];

const togetherPrompts = [
  "What should we build for your Buddy today?",
  "Can you make something taller than mine?",
  "Pick two colors. What can we make using mostly those?",
  "Build something that reminds you of today.",
  "You start the build, and I’ll finish it.",
  "Let’s each build something and tell a story about it.",
];

export default function BuildIdeasPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a className={styles.brand} href="/" aria-label="Back to Brick Buddy home">
          <span className={styles.brandMark}>B</span>
          <span>Brick Buddy</span>
        </a>
        <a className={styles.backLink} href="/">← Back to Brick Buddy</a>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>Brick Buddy Build Ideas</span>
          <h1>Small builds. <span>Big imagination.</span></h1>
          <p>Your Brick Buddy may be small, but there are lots of ways to play. Start with one of these simple ideas, then take it apart and make something completely your own.</p>
          <div className={styles.slogan}>BRING • BUILD • BOND</div>
          <a className={styles.primaryButton} href="#quick-builds">Start Building ↓</a>
        </div>
        <div className={styles.qrWelcome}>
          <span aria-hidden="true">✦</span>
          <strong>Got here by scanning the QR code?</strong>
          <p>You&apos;re in the right place. Pick a build below and start creating.</p>
        </div>
      </section>

      <section className={styles.inventoryStrip} aria-label="Brick Buddy included pieces">
        <div><strong>12</strong><span>colorful 2×4 bricks</span></div>
        <div><strong>{brickBuddyInventory.plate.quantity}</strong><span>6×10 build plate</span></div>
        <div><strong>1</strong><span>Surprise Buddy</span></div>
        <p>These builds are starting points, not rules. Change them, remix them, or invent your own.</p>
      </section>

      <section className={styles.section} id="quick-builds">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Quick Builds</span>
          <h2>Start with something simple.</h2>
          <p>Every starter build below uses only pieces that come with Brick Buddy.</p>
        </div>

        <div className={styles.buildGrid}>
          {buildIdeas.map((build) => (
            <article className={styles.buildCard} key={build.slug}>
              <div className={styles.buildVisualWrap}><BuildIdeaVisual build={build} /></div>
              <div className={styles.buildCardBody}>
                <div className={styles.buildMeta}>
                  <span>{build.difficulty}</span>
                  <span>{build.label}</span>
                  <span>{build.placements.length} bricks</span>
                </div>
                <h3>{build.name}</h3>
                <p>{build.story}</p>
                <ol>
                  {build.steps.map((step) => <li key={step}>{step}</li>)}
                </ol>
                <div className={styles.remix}><strong>Make it yours:</strong> {build.remix}</div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.callout}>
          <strong>Build it. Change it. Build it again.</strong>
          <span>The sample is only the starting point.</span>
        </div>
      </section>

      <section className={`${styles.section} ${styles.buddySection}`}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Build for Your Buddy</span>
          <h2>What does your Surprise Buddy need today?</h2>
          <p>Your Buddy can turn a handful of bricks into a story. Pick an idea and build your own version.</p>
        </div>
        <div className={styles.chipGrid}>
          {buddyPrompts.map((prompt) => <span key={prompt}>{prompt}</span>)}
        </div>
        <p className={styles.storyCopy}>Maybe your Buddy is an explorer today. Maybe they need a place to rest. Maybe they need the tallest tower in the world. <strong>You decide the story.</strong></p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Brick Buddy Challenge</span>
          <h2>Ready to build without instructions?</h2>
          <p>Choose one and see what you can make.</p>
        </div>
        <div className={styles.challengeGrid}>
          {challenges.map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <p className={styles.centerNote}>There are no winners here. The fun is seeing what everyone comes up with.</p>
      </section>

      <section className={`${styles.section} ${styles.togetherSection}`}>
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}>Build Together</span>
          <h2>A little prompt can turn waiting time into bonding time.</h2>
          <p>For parents, guardians, siblings, grandparents, or anyone building together.</p>
        </div>
        <div className={styles.promptGrid}>
          {togetherPrompts.map((prompt) => <blockquote key={prompt}>“{prompt}”</blockquote>)}
        </div>
        <p className={styles.storyCopy}>Brick Buddy was made for those little pockets of time when you&apos;re waiting, travelling, eating out, or simply sitting together. <strong>A few bricks can be enough to start a conversation.</strong></p>
      </section>

      <section className={`${styles.section} ${styles.makeItYours}`}>
        <span className={styles.eyebrow}>Make It Your Own</span>
        <h2>Your best build probably isn&apos;t on this page.</h2>
        <p>Take the ideas apart. Swap the colors. Turn the chair into a tower. Turn the bridge into a gate. Combine two builds. Start over.</p>
        <strong>That&apos;s the point.</strong>
        <div className={styles.finalQuestion}>What will you build next?</div>
        <div className={styles.slogan}>BRING • BUILD • BOND</div>
      </section>

      <section className={styles.returnSection}>
        <div>
          <span className={styles.eyebrow}>Your Brick Buddy order</span>
          <h2>Need to check your preorder?</h2>
          <p>Track your order, check payment status, or upload payment proof from the main Brick Buddy page.</p>
        </div>
        <a className={styles.primaryButton} href="/#preorder">Back to Brick Buddy</a>
      </section>

      <footer className={styles.footer}>
        <div><strong>Build safely</strong><p>Brick Buddy contains small parts and is not suitable for children under 3 years. Adult supervision is recommended.</p></div>
        <p>Brick Buddy is an independent creative-play product and is not affiliated with, authorized by, sponsored by, or endorsed by the LEGO Group.</p>
        <small>© 2026 Brick Buddy. BRING • BUILD • BOND.</small>
      </footer>
    </main>
  );
}
