import { OrderTracker } from "@/components/order-tracker";
import { PreorderForm } from "@/components/preorder-form";

const contents = [
  { icon: "▣", title: "Portable Case", text: "Small enough to bring, sturdy enough for everyday adventures." },
  { icon: "▦", title: "12 Colorful 2×4 Bricks", text: "Two each in six bright colors, ready for open-ended play." },
  { icon: "▤", title: "6×10 Build Plate", text: "A compact surface that turns the case into a place to create." },
  { icon: "?", title: "Surprise Buddy", text: "A mystery character figure tucked inside every Brick Buddy." },
];

const steps = [
  ["01", "Reserve your slot", "Choose your quantity and save a spot in the next batch."],
  ["02", "Confirm reservation", "Complete the ₱200 reservation and send payment confirmation."],
  ["03", "We prepare your Buddy", "We source, pack, check, and get your Brick Buddy ready."],
  ["04", "Ship or meet up", "Pay the remaining balance, then receive your Brick Buddy."],
];

const benefits = [
  ["◌", "Screen-free fun", "A small activity that invites hands-on play instead of another swipe."],
  ["▣", "Portable play", "Bring it to restaurants, road trips, appointments, or anywhere waiting happens."],
  ["♥", "Bonding time", "Build side by side, swap ideas, and turn spare moments into memories."],
];

export default function Home() {
  return (
    <main>
      <div className="announcement">🚚 Season 2 preorder • 10 launch slots available <span>BRING • BUILD • BOND</span></div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Brick Buddy home">
          <span className="brand-mark">B</span>
          <span>Brick Buddy</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#how">How it works</a>
          <a href="#story">Our story</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="header-cta" href="#preorder">Preorder</a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="pill">Brick Buddy • Season 2</span>
          <h1>Small case.<br /><span>Big imagination.</span></h1>
          <p className="hero-lead">A portable building experience for curious kids and the people who build with them.</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#preorder">Preorder for ₱449 <span>→</span></a>
            <a className="button button-secondary" href="#product">See what&apos;s inside</a>
          </div>
          <div className="trust-row">
            <div><strong>12</strong><span>building bricks</span></div>
            <div><strong>1</strong><span>Surprise Buddy</span></div>
            <div><strong>∞</strong><span>ways to play</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-label="Stylized Brick Buddy case illustration">
          <div className="sunburst sunburst-one" />
          <div className="sunburst sunburst-two" />
          <div className="case-shadow" />
          <div className="case-handle" />
          <div className="buddy-case">
            <span className="case-latch latch-left" />
            <span className="case-latch latch-right" />
            <div className="case-logo">Brick<br />Buddy <span>☺</span></div>
          </div>
          <div className="brick brick-red b1" /><div className="brick brick-blue b2" />
          <div className="brick brick-yellow b3" /><div className="brick brick-green b4" />
          <span className="visual-note">Built for brighter waiting time.</span>
        </div>
      </section>

      <section className="value-strip">
        <div><span>☻</span><strong>Family friendly</strong><small>Simple creative play</small></div>
        <div><span>◐</span><strong>Screen-free</strong><small>Hands stay busy</small></div>
        <div><span>⌂</span><strong>Take it anywhere</strong><small>Compact & portable</small></div>
        <div><span>♥</span><strong>Build together</strong><small>Connection over scrolling</small></div>
      </section>

      <section className="section" id="product">
        <div className="section-heading">
          <div><span className="eyebrow">Everything in one little case</span><h2>What&apos;s inside?</h2></div>
          <p>Brick Buddy keeps the starter kit intentionally simple, so kids can spend more time imagining and less time sorting.</p>
        </div>
        <div className="product-grid">
          {contents.map((item, index) => (
            <article className="product-card" key={item.title}>
              <div className={`product-art art-${index + 1}`}><span>{item.icon}</span></div>
              <div className="product-number">0{index + 1}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section how-section" id="how">
        <div className="section-heading centered">
          <div><span className="eyebrow">Easy from preorder to playtime</span><h2>How it works</h2></div>
          <p>A small-batch process keeps Season 2 simple and gives every Brick Buddy a proper quality check.</p>
        </div>
        <div className="steps-grid">
          {steps.map(([number, title, text], index) => (
            <article className="step-card" key={number}>
              <span className="step-number">{number}</span>
              <div className="step-icon">{["✎", "✓", "⚙", "□"][index]}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="buddy-feature" id="story">
        <div className="buddy-figure" aria-hidden="true">
          <div className="figure-head">☺</div><div className="figure-body">B</div><div className="figure-legs" />
        </div>
        <div className="buddy-copy">
          <span className="eyebrow">The surprise inside</span>
          <h2>A new Buddy in every case.</h2>
          <p>Each Brick Buddy includes a surprise character figure. Most are everyday Buddies, and every now and then a special one may show up—purely as a random surprise.</p>
          <div className="buddy-chips"><span>Explorer?</span><span>Hero?</span><span>Builder?</span><span>Something unexpected?</span></div>
          <small>No purchase quantity changes the chance of receiving any particular figure.</small>
        </div>
      </section>

      <section className="section parents-section">
        <div className="section-heading">
          <div><span className="eyebrow">Made from a parent&apos;s real problem</span><h2>Why parents love the idea</h2></div>
          <p>Brick Buddy began with one simple need: have something easy to reach for when waiting time starts turning into screen time.</p>
        </div>
        <div className="benefit-grid">
          {benefits.map(([icon, title, text]) => <article className="benefit-card" key={title}><span>{icon}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
        </div>
      </section>

      <section className="order-section" id="preorder">
        <div className="order-heading"><span className="eyebrow">First Season 2 batch</span><h2>Ready to bring a Buddy home?</h2><p>We&apos;re starting small: 10 preorder slots, then we build the next batch based on real demand.</p></div>
        <div className="order-grid"><PreorderForm /><OrderTracker /></div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="faq-heading"><span className="eyebrow">Need to know</span><h2>Frequently asked questions</h2></div>
        <div className="faq-list">
          <details><summary>What comes with one Brick Buddy?<span>+</span></summary><p>A portable case, 12 colorful 2×4 building bricks, one 6×10 build plate, and one Surprise Buddy character figure.</p></details>
          <details><summary>How much is the Season 2 preorder?<span>+</span></summary><p>The working Season 2 price is ₱449: ₱200 to reserve the slot and ₱249 remaining before fulfillment.</p></details>
          <details><summary>How long does preorder take?<span>+</span></summary><p>The current small-batch target is roughly 10–12 days from preorder opening through assembly and initial fulfillment, depending on material arrival.</p></details>
          <details><summary>Can I choose the Surprise Buddy?<span>+</span></summary><p>No. The figure is intentionally random. Buying more units does not improve or change the chance of receiving a special figure.</p></details>
        </div>
      </section>

      <footer>
        <div className="footer-brand"><a className="brand" href="#top"><span className="brand-mark">B</span><span>Brick Buddy</span></a><p>Bring it. Build something. Bond over it.</p></div>
        <div className="footer-links"><a href="#product">Product</a><a href="#how">How it works</a><a href="#preorder">Preorder</a><a href="#faq">FAQ</a></div>
        <div className="footer-legal"><p>Brick Buddy is an independent creative-play product and is not affiliated with, authorized by, or endorsed by the LEGO Group or other toy manufacturers.</p><p><strong>Safety:</strong> Contains small parts. Not suitable for children under 3 years. Adult supervision recommended.</p><p>© 2026 Brick Buddy. All rights reserved.</p></div>
      </footer>
    </main>
  );
}
