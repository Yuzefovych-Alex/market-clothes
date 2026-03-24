import Link from "next/link";
import MobileMenu from "../MobileMenu/MobileMenu";
import styles from "./HeaderOrder.module.css";

export default function HeaderOrder() {
  return (
    <header className={styles.headerOrder}>
      <div className={styles.headerOrder__container}>
        <h1 className={styles.headerOrder__container__title}>
          <Link href="/" className={styles.headerOrder__link}>
            MARCELO MIRACLES
          </Link>
        </h1>
        <MobileMenu />
      </div>
    </header>
  );
}
