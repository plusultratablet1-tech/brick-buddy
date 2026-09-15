import { notFound } from "next/navigation";
import { AdminSetupForm } from "@/components/admin-setup-form";
import styles from "@/components/admin.module.css";

export default function AdminSetupPage() {
  const environment = process.env.VERCEL_ENV ?? (process.env.NODE_ENV === "development" ? "development" : "production");
  if (environment !== "preview" && environment !== "development") notFound();

  return (
    <main className={styles.loginWrap}>
      <section className={styles.loginCard}>
        <span className="eyebrow">One-time Brick Buddy setup</span>
        <h1>Create owner admin</h1>
        <p className={styles.muted}>This private Preview-only setup creates the first Brick Buddy admin. Once an active admin exists, setup locks automatically.</p>
        <AdminSetupForm />
      </section>
    </main>
  );
}
