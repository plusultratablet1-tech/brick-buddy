import type React from "react";
import type { BuildIdea } from "../lib/build-ideas";
import styles from "./build-idea-visual.module.css";

export function BuildIdeaVisual({ build, compact = false }: { build: BuildIdea; compact?: boolean }) {
  return (
    <div
      className={compact ? `${styles.visual} ${styles.compact}` : styles.visual}
      aria-label={`${build.name} build diagram`}
    >
      <div className={styles.plate}>
        <span className={styles.plateStuds} aria-hidden="true" />
        {build.placements.map((brick, index) => {
          const width = brick.rotation === 0 ? 4 : 2;
          const depth = brick.rotation === 0 ? 2 : 4;
          return (
            <span
              key={`${build.slug}-${index}`}
              data-build-brick={brick.color}
              className={`${styles.brick} ${styles[`color-${brick.color}`]}`}
              style={{
                "--x": brick.x,
                "--y": brick.y,
                "--layer": brick.layer,
                "--brick-width": width,
                "--brick-depth": depth,
              } as React.CSSProperties}
            >
              <span className={styles.brickStuds} aria-hidden="true" />
            </span>
          );
        })}
      </div>
    </div>
  );
}
