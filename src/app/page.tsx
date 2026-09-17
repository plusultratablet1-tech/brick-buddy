import { BuildIdeasPreview } from "@/components/build-ideas-preview";
import { OrderTracker } from "@/components/order-tracker";
import { PreorderForm } from "@/components/preorder-form";
import styles from "./home.module.css";

const steps = [
  ["01", "Reserve your slot", "Choose your quantity and save a spot in the next batch for 24 hours."],
  ["02", "Confirm reservation", "Complete the ₱200-per-unit reservation while your slot is held."],
  ["03", "We prepare your Buddy", "We source, pack, check, and get your Brick Buddy ready."],
  ["04", "Ship or meet up", "Pay the remaining balance, then receive your Brick Buddy."],
];

const inside = [
  ["12 × 2×4 bricks", "Two of each color: red, yellow, orange, blue, green and purple."],
  ["6×10 build plate", "A compact building surface attached to the top of the case."],
  ["1 Surprise Buddy", "A character figure with an occasional special Buddy mixed in at random."],
  ["Portable case", "A small clear case made to keep the whole activity together on the go."],
];

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.announcement}>
        <span>Season 2 preorder • 15-unit launch batch</span>
        <strong>BUILD • BOND • BRING</strong>
      </div>

      <header className={styles.header}>
        <a className={styles.brand} href="#top" aria-label="Brick Buddy home">
          <span className={styles.brandMark}>B</span>
          <span>Brick Buddy</span>
        </a>
        <nav className={styles.nav} aria-label="Primary navigation">
          <a href="#meet">Meet Brick Buddy</a>
          <a href="#inside">What&apos;s inside</a>
          <a href="/build-ideas">Build ideas</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className={styles.headerCta} href="#preorder">Preorder</a>
      </header>

      <section className={styles.hero} id="top">
        <div className={styles.heroImageFrame}>
          <img
            className={styles.heroImage}
            src="/images/brick-buddy-locked.png"
            alt="Locked Brick Buddy product views"
          />
          <div className={styles.heroShade} aria-hidden="true" />
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Brick Buddy • Season 2</span>
            <h1>BUILD • BOND • BRING</h1>
            <p>A pocket-sized invitation to put the screen down, make something, and share the moment.</p>
            <a className={styles.primaryButton} href="#preorder">Preorder for ₱449 <span>→</span></a>
          </div>
        </div>
      </section>

      <section className={styles.intro} id="meet">
        <span className={styles.eyebrow}>Meet Brick Buddy</span>
        <h2>A little case built for the moments in between.</h2>
        <p>
          Brick Buddy keeps creative play close at hand: a portable clear case, colorful building bricks,
          a build plate on top, and a Surprise Buddy inside. Open it when waiting time needs something
          better than another scroll.
        </p>
      </section>

      <section className={styles.storySection} id="story">
        <div className={styles.storyVisual}>
          <img src="/images/brick-buddy-locked.png" alt="Brick Buddy portable case in four product views" />
        </div>
        <div className={styles.storyCopy}>
          <span className={styles.eyebrow}>Why Brick Buddy Exists</span>
          <h2>Because waiting time can become together time.</h2>
          <p>
            The idea came from a real parent problem: needing a simple activity for a child while waiting,
            without automatically reaching for a phone or tablet. Brick Buddy is meant to be easy to bring,
            quick to open, and simple enough for a parent and child to start building side by side.
          </p>
          <p className={styles.pullQuote}>Less scrolling. More making. More small moments together.</p>
        </div>
      </section>

      <section className={styles.fullBleed}>
        <div className={styles.fullBleedCopy}>
          <span className={styles.eyebrowLight}>Build Anywhere</span>
          <h2>The table becomes a tiny play space.</h2>
          <p>Restaurants, appointments, road trips or anywhere a few quiet minutes need a better idea.</p>
        </div>
        <div className={styles.brickField} aria-hidden="true">
          <span className={styles.redBrick} />
          <span className={styles.blueBrick} />
          <span className={styles.yellowBrick} />
          <span className={styles.greenBrick} />
          <span className={styles.orangeBrick} />
          <span className={styles.purpleBrick} />
        </div>
      </section>

      <section className={styles.gallerySection} id="inside">
        <div className={styles.galleryHeading}>
          <span className={styles.eyebrow}>What’s Inside</span>
          <h2>Everything has a place.</h2>
          <p>The locked Brick Buddy layout keeps the product compact while leaving room for the Surprise Buddy.</p>
        </div>
        <figure className={styles.productGallery}>
          <img src="/images/brick-buddy-locked.png" alt="Locked Brick Buddy product views" />
          <figcaption>Closed • Open • Top • Front-side</figcaption>
        </figure>
        <div className={styles.specGrid}>
          {inside.map(([title, text]) => (
            <article className={styles.specItem} key={title}>
              <span className={styles.specDot} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <BuildIdeasPreview />

      <section className={`${styles.storySection} ${styles.reverse}`}>
        <div className={styles.surpriseVisual} aria-hidden="true">
          <div className={styles.figureHead}>☺</div>
          <div className={styles.figureBody}>B</div>
          <div className={styles.figureLegs} />
          <span>?</span>
        </div>
        <div className={styles.storyCopy}>
          <span className={styles.eyebrow}>Your Buddy Is a Surprise</span>
          <h2>Every case comes with somebody to build for.</h2>
          <p>
            Each Brick Buddy includes a character figure. Most are everyday Buddies, and every now and then
            a special or premium Buddy may be added purely at random.
          </p>
          <small className={styles.finePrint}>Buying more units does not improve or change the chance of receiving a special figure.</small>
        </div>
      </section>

      <section className={styles.togetherSection}>
        <div>
          <span className={styles.eyebrow}>Build Together</span>
          <h2>The bricks are small. The point is bigger.</h2>
        </div>
        <p>
          Brick Buddy is designed to create a reason to sit together for a few minutes: trade pieces, make a
          tiny challenge, invent a story, rebuild it, and remember the time spent together rather than the wait.
        </p>
      </section>

      <section className={styles.portableSection}>
        <div className={styles.portableImage}>
          <img src="/images/brick-buddy-locked.png" alt="Brick Buddy compact case and studded build plate" />
        </div>
        <div className={styles.portableCopy}>
          <span className={styles.eyebrow}>Portable by Design</span>
          <h2>One compact case. Ready when you need it.</h2>
          <p>
            The clear case keeps the bricks and Buddy visible, the latch keeps the pack together, and the studded
            top becomes part of the play instead of extra packaging to carry around.
          </p>
          <div className={styles.portableFacts}>
            <span><strong>12</strong> bricks</span>
            <span><strong>6×10</strong> plate</span>
            <span><strong>1</strong> Buddy</span>
          </div>
        </div>
      </section>

      <section className={styles.howSection} id="how">
        <div className={styles.centerHeading}>
          <span className={styles.eyebrow}>From preorder to playtime</span>
          <h2>How it works</h2>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map(([number, title, text]) => (
            <article className={styles.step} key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.preorderLead}>
        <span className={styles.eyebrowLight}>Season 2 • 15-unit launch batch</span>
        <h2>Ready to Bring a Buddy?</h2>
        <p>Reserve one from the current batch, or track an existing Brick Buddy order below.</p>
        <a href="#preorder">Start preorder <span>↓</span></a>
      </section>

      <section className={styles.orderSection} id="preorder">
        <div className={styles.orderGrid}>
          <PreorderForm />
          <OrderTracker />
        </div>
      </section>

      <section className={styles.faq} id="faq">
        <div className={styles.faqHeading}>
          <span className={styles.eyebrow}>Need to know</span>
          <h2>Frequently asked questions</h2>
        </div>
        <div className={styles.faqList}>
          <details><summary>What comes with one Brick Buddy?<span>+</span></summary><p>A portable case, 12 colorful 2×4 building bricks, one 6×10 build plate, and one Surprise Buddy character figure.</p></details>
          <details><summary>How much is the Season 2 preorder?<span>+</span></summary><p>Season 2 is ₱449 per unit: ₱200 to reserve the slot and ₱249 remaining before fulfillment.</p></details>
          <details><summary>How long is my slot held?<span>+</span></summary><p>After you create an order, your requested units are held for 24 hours while the reservation payment is completed. An unpaid hold can expire and return those units to the batch.</p></details>
          <details><summary>How do I submit payment proof?<span>+</span></summary><p>Use your order number and matching preorder email in the order tracker. When payment is due, the tracker will show the private proof-upload form. Proof must be reviewed before payment is marked approved.</p></details>
          <details><summary>How long does preorder take?<span>+</span></summary><p>The current small-batch target is roughly 10–12 days from preorder opening through assembly and initial fulfillment, depending on material arrival.</p></details>
          <details><summary>Can I choose the Surprise Buddy?<span>+</span></summary><p>No. The figure is intentionally random. Buying more units does not improve or change the chance of receiving a special figure.</p></details>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          <a className={styles.brand} href="#top"><span className={styles.brandMark}>B</span><span>Brick Buddy</span></a>
          <p>Build • Bond • Bring</p>
        </div>
        <div className={styles.footerLinks}>
          <a href="#meet">Product story</a><a href="/build-ideas">Build ideas</a><a href="#preorder">Preorder & tracking</a><a href="#faq">FAQ</a><a href="/privacy">Privacy</a><a href="/terms">Preorder terms</a><a href="/safety">Safety</a>
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
