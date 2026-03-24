"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { loginAdmin } from "@/lib/api";
import Footer from "@/app/components/Footer/Footer";
import styles from "./page.module.css";

export default function AdminLoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginAdmin(login.trim(), password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка входа");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.login}>
      <header className={styles.login__header}>
        <Link href="/" className={styles.login__brand}>
          MARCELO MIRACLES
        </Link>
      </header>

      <main className={styles.login__main}>
        <form className={styles.login__card} onSubmit={handleSubmit}>
          <h1 className={styles.login__title}>Вход в админ-панель</h1>
          <p className={styles.login__subtitle}>
            Введите логин и пароль администратора.
          </p>

          <label className={styles.login__label}>
            Логин
            <input
              className={styles.login__input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className={styles.login__label}>
            Пароль
            <input
              className={styles.login__input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          {error ? <p className={styles.login__error}>{error}</p> : null}

          <div className={styles.login__actions}>
            <button type="submit" className={styles.login__submit} disabled={submitting}>
              {submitting ? "Вход..." : "Войти"}
            </button>
            <Link href="/" className={styles.login__back}>
              На сайт
            </Link>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
