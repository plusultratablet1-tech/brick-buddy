"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./preorder-form.module.css";

type Availability = {
  capacity: number;
  remainingSlots: number;
  soldOut: boolean;
};

type PreorderSuccess = {
  order: {
    orderNumber: string;
    quantity: number;
    totalAmount: number;
    reservationTotal: number;
    balanceTotal: number;
    status: string;
    holdExpiresAt: string;
  };
  paymentInstructions: {
    isDemo: boolean;
    method: string;
    accountName: string;
    accountNumber: string;
    notice: string;
  };
  remainingSlots: number;
};

const UNIT_PRICE = 449;
const RESERVATION_PER_UNIT = 200;
const BALANCE_PER_UNIT = 249;

function peso(value: number) {
  return `₱${value.toLocaleString("en-PH")}`;
}

export function PreorderForm() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<PreorderSuccess | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAvailability() {
      try {
        const response = await fetch("/api/preorders/availability", { cache: "no-store" });
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body?.error || "Availability unavailable");
        }

        if (active) {
          setAvailability(body);
          setAvailabilityError("");
          if (body.remainingSlots > 0) {
            setQuantity((current) => Math.min(current, body.remainingSlots, 3));
          }
        }
      } catch {
        if (active) {
          setAvailabilityError("Live slot count is temporarily unavailable. Final availability will be checked when you reserve.");
        }
      }
    }

    loadAvailability();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setSubmitting(true);
    setError("");
    setSuccess(null);

    try {
      const response = await fetch("/api/preorders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          mobile: String(data.get("mobile") || ""),
          quantity: Number(data.get("quantity")),
          fulfillment: String(data.get("fulfillment") || ""),
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        setError(body?.error || "We could not create your preorder. Please try again.");
        if (response.status === 409) {
          const availabilityResponse = await fetch("/api/preorders/availability", { cache: "no-store" });
          if (availabilityResponse.ok) {
            const latest = await availabilityResponse.json();
            setAvailability(latest);
          }
        }
        return;
      }

      const result = body as PreorderSuccess;
      setSuccess(result);
      setAvailability((current) => ({
        capacity: current?.capacity ?? 15,
        remainingSlots: result.remainingSlots,
        soldOut: result.remainingSlots === 0,
      }));
      form.reset();
      setQuantity(1);
    } catch {
      setError("We could not reach the preorder service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const soldOut = availability?.soldOut || availability?.remainingSlots === 0;
  const holdDeadline = success
    ? new Date(success.order.holdExpiresAt).toLocaleString("en-PH", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  return (
    <form className="preorder-form" onSubmit={handleSubmit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">Season 2 preorder</span>
          <h3>Reserve your Brick Buddy</h3>
        </div>
        <div className="price-badge">
          <strong>{peso(UNIT_PRICE * quantity)}</strong>
          <span>{peso(RESERVATION_PER_UNIT * quantity)} reserve</span>
        </div>
      </div>

      {availability ? (
        <div className={styles.availability} aria-live="polite">
          <strong>{availability.remainingSlots}</strong> of {availability.capacity} launch slots remaining
        </div>
      ) : availabilityError ? (
        <div className={styles.availabilityWarning}>{availabilityError}</div>
      ) : (
        <div className={styles.availability}>Checking live launch availability…</div>
      )}

      <label>
        Parent / Guardian name
        <input name="name" required maxLength={120} placeholder="Your name" autoComplete="name" />
      </label>
      <label>
        Email address
        <input name="email" type="email" required maxLength={254} placeholder="you@example.com" autoComplete="email" />
      </label>
      <div className="form-row">
        <label>
          Mobile number
          <input name="mobile" required maxLength={32} placeholder="09xx xxx xxxx" inputMode="tel" autoComplete="tel" />
        </label>
        <label>
          Quantity
          <select
            name="quantity"
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={soldOut}
          >
            {[1, 2, 3].map((value) => (
              <option
                value={value}
                key={value}
                disabled={availability ? value > availability.remainingSlots : false}
              >
                {value} {value === 1 ? "case" : "cases"}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Preferred fulfillment
        <select name="fulfillment" defaultValue="shipping" disabled={soldOut}>
          <option value="shipping">Shipping</option>
          <option value="meetup">Meet-up</option>
        </select>
      </label>

      <div className={styles.priceSummary}>
        <span>Reservation due</span><strong>{peso(RESERVATION_PER_UNIT * quantity)}</strong>
        <span>Remaining balance</span><strong>{peso(BALANCE_PER_UNIT * quantity)}</strong>
      </div>

      <button className="button button-primary form-submit" type="submit" disabled={submitting || soldOut}>
        {soldOut ? "Launch batch sold out" : submitting ? "Reserving…" : "Reserve my slot"}
        {!soldOut && !submitting ? <span>→</span> : null}
      </button>
      <p className="form-note">Submitting reserves your slot for 24 hours. No payment is charged on this page, and payment is not considered received until separately confirmed.</p>

      {error ? <div className={styles.errorMessage} role="alert">{error}</div> : null}

      {success ? (
        <div className={styles.confirmation} role="status">
          <span className={styles.confirmationLabel}>Reservation created</span>
          <strong className={styles.orderNumber}>{success.order.orderNumber}</strong>
          <p>Your {success.order.quantity === 1 ? "slot is" : `${success.order.quantity} slots are`} held until <strong>{holdDeadline}</strong> while you complete the reservation payment.</p>
          <div className={styles.confirmationGrid}>
            <div><span>Reservation due</span><strong>{peso(success.order.reservationTotal)}</strong></div>
            <div><span>Balance after reservation</span><strong>{peso(success.order.balanceTotal)}</strong></div>
          </div>

          <div className={styles.demoPayment}>
            <div className={styles.demoPaymentHeading}>
              <span>Demo payment step</span>
              <strong>{success.paymentInstructions.method}</strong>
            </div>
            <div className={styles.demoWarning}>{success.paymentInstructions.notice}</div>
            <div className={styles.demoAccount}>
              <span>Account name</span>
              <strong>{success.paymentInstructions.accountName}</strong>
              <span>Account number</span>
              <strong>{success.paymentInstructions.accountNumber}</strong>
              <span>Amount to reserve</span>
              <strong>{peso(success.order.reservationTotal)}</strong>
            </div>
            <div className={styles.demoSteps}>
              <strong>What happens next</strong>
              <ol>
                <li>This demo represents sending the reservation amount through GCash.</li>
                <li>Save the payment receipt or screenshot.</li>
                <li>Open the Order Status panel using <strong>{success.order.orderNumber}</strong> and the same preorder email.</li>
                <li>Upload the proof. The payment stays pending until an admin approves it.</li>
              </ol>
            </div>
          </div>

          <small>Keep your order number. Payment is only confirmed after the uploaded proof is reviewed.</small>
        </div>
      ) : null}
    </form>
  );
}
