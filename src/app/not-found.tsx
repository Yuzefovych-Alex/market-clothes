import Link from "next/link";
import Footer from "./components/Footer/Footer";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <header className={styles.notFound__header}>
        <Link href="/" className={styles.notFound__brand}>
          MARCELO MIRACLES
        </Link>
      </header>

      <main className={styles.notFound__main}>
        <p className={styles.notFound__code}>404</p>
        <h1 className={styles.notFound__title}>Страница не найдена</h1>
        <p className={styles.notFound__text}>
          Возможно, ссылка устарела или страница была перемещена.
        </p>

        <div className={styles.notFound__actions}>
          <Link href="/" className={styles.notFound__primary}>
            На главную
          </Link>
          <Link href="/products" className={styles.notFound__secondary}>
            В каталог
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
