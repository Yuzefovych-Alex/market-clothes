"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { resolveAssetUrl } from "@/lib/api";
import { formatRub } from "@/lib/format";
import styles from "./BasketContent.module.css";

export default function BasketContent() {
  const { lines, setQuantity, removeLine, clearCart } = useCart();

  if (lines.length === 0) {
    return (
      <div className={styles.basketContent}>
        <p className={styles.basketContent__empty}>Пока тут ничего нет</p>
      </div>
    );
  }

  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  return (
    <div className={styles.basketContent}>
      <ul className={styles.basketContent__list}>
        {lines.map((line) => (
          <li key={line.lineId} className={styles.basketContent__row}>
            <div
              className={styles.basketContent__image}
              style={{
                backgroundColor: line.imageColor ?? "#e8e8e8",
                backgroundImage: line.imageUrl
                  ? `url("${resolveAssetUrl(line.imageUrl)}")`
                  : undefined,
              }}
            />
            <div className={styles.basketContent__main}>
              <Link
                href={`/products/${line.productId}`}
                className={styles.basketContent__title}
              >
                {line.title} ({line.size})
              </Link>
            </div>
            <div className={styles.basketContent__controls}>
              <label className={styles.basketContent__qtyLabel}>
                Количество
                <select
                  className={styles.basketContent__select}
                  value={line.quantity}
                  onChange={(e) => setQuantity(line.lineId, Number(e.target.value))}
                  aria-label="Количество"
                >
                  {Array.from({ length: 10 }, (_, idx) => idx + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className={styles.basketContent__price}>{formatRub(line.price)}</p>
            <button
              type="button"
              className={styles.basketContent__remove}
              aria-label="Удалить товар"
              onClick={() => removeLine(line.lineId)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <section className={styles.basketContent__footer} aria-label="Итого и оформление">
        <div className={styles.basketContent__summary}>
          <p className={styles.basketContent__total}>Итого: {formatRub(total)}</p>
        </div>

        <div className={styles.basketContent__bottom}>
          <button
            type="button"
            className={styles.basketContent__clear}
            onClick={clearCart}
          >
            Очистить корзину
          </button>
          <div className={styles.basketContent__checkout}>
            <input
              className={styles.basketContent__promo}
              placeholder="Промо-код (если есть)"
              aria-label="Промо-код"
            />
            <Link href="/order" className={styles.basketContent__order}>
              Оформить заказ
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
