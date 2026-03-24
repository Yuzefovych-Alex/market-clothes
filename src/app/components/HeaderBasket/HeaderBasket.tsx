import Link from "next/link";
import MobileMenu from "../MobileMenu/MobileMenu";
import styles from "./HeaderBasket.module.css";

export default function HeaderBasket() {
  return (
    <header className={styles.headerBasket}>
      <div className={styles.headerBasket__container}>
        <h1 className={styles.headerBasket__container__title}>
          <Link href="/" className={styles.headerBasket__link}>
            MARCELO MIRACLES
          </Link>
        </h1>
        <h2 className={styles.headerBasket__container__basket}>КОРЗИНА</h2>
        <MobileMenu />
      </div>
    </header>
  );
}
