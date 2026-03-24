import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer__container}>
                <div className={styles.footer__container__description}>
                    <div className={styles.footer__container__description__publicOfther}>публичная офера</div>
                    <div className={styles.footer__container__description__privatePolicy}>политика конфиденциальности и обработки персональных данных</div>
                </div>
                <div className={styles.footer__container__copyrightNotice}>© 2024 MARCELO MIRACLES 55 RUE DE NOTRE-DAME DE NAZARETH 75003 PARIS </div>
            </div>
        </footer>
    );
}