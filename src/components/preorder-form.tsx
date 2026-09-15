"use client";

import { FormEvent, useState } from "react";

export function PreorderForm() {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "there").trim() || "there";
    setMessage(`Thanks, ${name}! Your Brick Buddy preorder details are ready for confirmation.`);
  }

  return (
    <form className="preorder-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">Season 2 preorder</span>
          <h3>Reserve your Brick Buddy</h3>
        </div>
        <div className="price-badge">
          <strong>₱449</strong>
          <span>₱200 reserve</span>
        </div>
      </div>
      <label>
        Parent / Guardian name
        <input name="name" required placeholder="Your name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required placeholder="you@example.com" />
      </label>
      <div className="form-row">
        <label>
          Mobile number
          <input name="mobile" required placeholder="09xx xxx xxxx" />
        </label>
        <label>
          Quantity
          <select name="quantity" defaultValue="1">
            <option value="1">1 case</option>
            <option value="2">2 cases</option>
            <option value="3">3 cases</option>
          </select>
        </label>
      </div>
      <label>
        Preferred fulfillment
        <select name="fulfillment" defaultValue="shipping">
          <option value="shipping">Shipping</option>
          <option value="meetup">Meet-up</option>
        </select>
      </label>
      <button className="button button-primary form-submit" type="submit">
        Reserve my slot <span>→</span>
      </button>
      <p className="form-note">V1 demo: no payment is charged on this page yet. We’ll connect live reservations and payment proof next.</p>
      {message ? <div className="success-message">✓ {message}</div> : null}
    </form>
  );
}
