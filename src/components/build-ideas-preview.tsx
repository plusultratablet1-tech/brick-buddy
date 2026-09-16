import { BuildIdeaVisual } from "./build-idea-visual";
import { buildIdeas } from "../lib/build-ideas";
import styles from "./build-ideas-preview.module.css";

export function BuildIdeasPreview() {
  const previewBuilds = buildIdeas.slice(0, 3);

  return (
    <section className={styles.preview} aria-labelledby="build-ideas-preview-heading">
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>Mini build guide + QR code</span>
          <h2 id="build-ideas-preview-heading">What can you build?</h2>
        </div>
        <p>Brick Buddy gives kids an easy place to start. Try a few mini builds from the guide, then scan the QR code for more ideas online.</p>
      </div>

      <div className={styles.grid}>
        {previewBuilds.map((build) => (
          <article className={styles.card} key={build.slug} data-build-preview={build.slug}>
            <div className={styles.visual}><BuildIdeaVisual build={build} compact /></div>
            <div className={styles.cardCopy}>
              <span>{build.difficulty} • {build.label}</span>
              <h3>{build.name}</h3>
              <p>{build.story}</p>
            </div>
          </article>
        ))}
      </div>

      <div className={styles.footerRow}>
        <div>
          <strong>Build it. Change it. Build it again.</strong>
          <span>Every example uses pieces included with Brick Buddy.</span>
        </div>
        <a href="/build-ideas">Explore Build Ideas <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
