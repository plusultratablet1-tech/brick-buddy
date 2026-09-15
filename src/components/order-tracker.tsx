const stages = [
  ["Reservation payment", "Complete within your 24-hour hold"],
  ["Materials secured", "Your Buddy enters the batch"],
  ["Building / QC", "Packing and quality check"],
  ["Balance due", "Settle the remaining balance"],
  ["Ready", "Ship or arrange meet-up"],
];

export function OrderTracker() {
  return (
    <div className="tracker-card">
      <span className="eyebrow">After you reserve</span>
      <h3>What happens next?</h3>
      <p>Your confirmation gives you a real Brick Buddy order number and holds your requested slots for 24 hours. Phase 1 does not charge you automatically.</p>
      <div className="timeline">
        {stages.map(([stage, note], index) => (
          <div className="timeline-item" key={stage}>
            <span className="timeline-dot">{index + 1}</span>
            <div>
              <strong>{stage}</strong>
              <small>{note}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="tracker-result">Keep the order number shown after you reserve. Live customer status tracking will be added in a later phase.</div>
    </div>
  );
}
