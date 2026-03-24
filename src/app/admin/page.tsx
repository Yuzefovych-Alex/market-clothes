"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAdminToken, fetchAdminSession } from "@/lib/api";
import { AdminCatalog } from "./AdminCatalog";
import { AdminCategories } from "./AdminCategories";
import { AdminInsights } from "./AdminInsights";
import styles from "./page.module.css";

type Tab = "catalog" | "menu" | "insights";

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalog");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [adminLogin, setAdminLogin] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await fetchAdminSession();
        if (!cancelled) {
          setAdminLogin(session.login);
          setCheckingAuth(false);
        }
      } catch {
        if (!cancelled) {
          router.replace("/admin/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    clearAdminToken();
    router.replace("/admin/login");
  }

  if (checkingAuth) {
    return (
      <div className={styles.adminLoading}>
        <p className={styles.adminLoading__text}>Проверка доступа…</p>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.shell__nav}>
        <div className={styles.shell__brand}>
          <Link href="/" className={styles.shell__brandLink}>
            MARCELO MIRACLES
          </Link>
          <span className={styles.shell__badge}>Admin</span>
        </div>
        <nav className={styles.shell__menu} aria-label="Разделы админки">
          <button
            type="button"
            className={`${styles.navBtn} ${tab === "catalog" ? styles.navBtn_active : ""}`}
            onClick={() => setTab("catalog")}
          >
            Товары
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${tab === "menu" ? styles.navBtn_active : ""}`}
            onClick={() => setTab("menu")}
          >
            Категории меню
          </button>
          <button
            type="button"
            className={`${styles.navBtn} ${tab === "insights" ? styles.navBtn_active : ""}`}
            onClick={() => setTab("insights")}
          >
            Аналитика и корзины
          </button>
        </nav>
        <p className={styles.shell__user}>Вы вошли как: {adminLogin}</p>
        <button type="button" className={styles.shell__logout} onClick={handleLogout}>
          Выйти
        </button>
        <Link href="/" className={styles.shell__back}>
          ← На сайт
        </Link>
      </aside>

      <div className={styles.shell__main}>
        <header className={styles.shell__header}>
          <h1 className={styles.shell__title}>
            {tab === "catalog"
              ? "Товары"
              : tab === "menu"
                ? "Категории бокового меню"
                : "Аналитика и корзины посетителей"}
          </h1>
          <p className={styles.shell__lead}>
            {tab === "catalog"
              ? "Добавление, редактирование и удаление товаров в базе данных."
              : tab === "menu"
                ? "Названия пунктов меню, порядок и опциональная ссылка вместо фильтра каталога."
                : "Визиты, просмотры страниц и содержимое корзин по посетителям."}
          </p>
        </header>

        <div className={styles.shell__body}>
          {tab === "catalog" ? (
            <AdminCatalog />
          ) : tab === "menu" ? (
            <AdminCategories />
          ) : (
            <AdminInsights />
          )}
        </div>
      </div>
    </div>
  );
}
