import Link from "next/link";
import MobileMenu from "../MobileMenu/MobileMenu";
import styles from "./HeaderProduct.module.css";

export default function HeaderProduct() {
  return (
    <div className={styles.headerProduct}>
      <div className={styles.headerProduct__container}>
        <h3 className={styles.headerProduct__container__title}>
          <Link href="/" className={styles.headerProduct__link}>
            MARCELO MIRACLES
          </Link>
        </h3>
        <Link href="/basket" className={styles.headerProduct__container__basket}>
          КОРЗИНА
        </Link>
        <MobileMenu />
      </div>
    </div>
  );
}
