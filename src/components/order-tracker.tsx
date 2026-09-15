"use client";

import { FormEvent, useState } from "react";

const stages = ["Reserved", "Materials secured", "Building / QC", "Balance due", "Ready to ship"];

export function OrderTracker() {
  const [activeStage, setActiveStage] = useState(1);
  const [searched, setSearched] = useState(false);

  function track(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("order") || "").trim();
    setActiveStage(value.toLowerCase().includes("ready") ? 4 : value.toLowerCase().includes("build") ? 2 : 1);
    setSearched(true);
  }

  return (
    <div className="tracker-card">
      <span className="eyebrow">Order status</span>
      <h3>Track your Brick Buddy</h3>
      <p>Enter your order number or email. For this V1 preview, try <strong>BB-BUILD</strong> or <strong>BB-READY</strong>.</p>
      <form className="track-form" onSubmit={track}>
        <input name="order" required placeholder="Order number or email" />
        <button className="button button-dark" type="submit">Track</button>
      </form>
      <div className="timeline">
        {stages.map((stage, index) => (
          <div className={`timeline-item ${index <= activeStage ? "complete" : ""}`} key={stage}>
            <span className="timeline-dot">{index < activeStage ? "✓" : index + 1}</span>
            <div>
              <strong>{stage}</strong>
              <small>{index <= activeStage ? "Updated" : "Pending"}</small>
            </div>
          </div>
        ))}
      </div>
      {searched ? <div className="tracker-result">Latest status loaded for this preview.</div> : null}
    </div>
  );
}
