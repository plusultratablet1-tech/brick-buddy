import { AdminLoginForm } from "@/components/admin-login-form";
import styles from "@/components/admin.module.css";

export default function AdminLoginPage() {
  return (
    <main className={styles.loginWrap}>
      <section className={styles.loginCard}>
        <span className="eyebrow">Brick Buddy operations</span>
        <h1>Admin sign in</h1>
        <p className={styles.muted}>Private access for reviewing payments and managing launch orders.</p>
        <AdminLoginForm />
      </section>
    </main>
  );
}
