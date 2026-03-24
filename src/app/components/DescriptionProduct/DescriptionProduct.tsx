"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { resolveAssetUrl } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatRub } from "@/lib/format";
import styles from "./DescriptionProduct.module.css";

type Props = {
  product: Product;
};

export default function DescriptionProduct({ product }: Props) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "M");
  const [addedFlash, setAddedFlash] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const bg = product.imageColor ?? "#e8e8e8";
  const imageUrls =
    product.imageUrls && product.imageUrls.length > 0
      ? product.imageUrls
      : product.imageUrl
        ? [product.imageUrl]
        : [];
  const activeRaw = imageUrls[activeIndex] || product.imageUrl || "";
  const imageUrl = activeRaw ? resolveAssetUrl(activeRaw) : "";

  function handleAddToCart() {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      size,
      imageColor: product.imageColor,
      imageUrl: activeRaw || product.imageUrl,
      quantity: 1,
    });
    setAddedFlash(true);
    window.setTimeout(() => setAddedFlash(false), 1200);
  }

  return (
    <div className={styles.descriptionProduct}>
      <div className={styles.descriptionProduct__container}>
        <div className={styles.descriptionProduct__gallery}>
          <div
            className={styles.descriptionProduct__galleryMain}
            style={{
              backgroundColor: bg,
              backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            aria-label={product.title}
          />
        </div>

        <div className={styles.descriptionProduct__info}>
          <h1 className={styles.descriptionProduct__title}>{product.title}</h1>

          {imageUrls.length > 0 ? (
            <ul className={styles.descriptionProduct__thumbnails}>
              {imageUrls.map((rawUrl, i) => (
                <li key={`${rawUrl}-${i}`} className={styles.descriptionProduct__thumb}>
                  <button
                    type="button"
                    className={`${styles.descriptionProduct__thumbBtn} ${
                      i === activeIndex ? styles.descriptionProduct__thumbBtn_active : ""
                    }`}
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Фото ${i + 1}`}
                  >
                    <span
                      className={styles.descriptionProduct__thumbInner}
                      style={{
                        backgroundColor: bg,
                        backgroundImage: `url("${resolveAssetUrl(rawUrl)}")`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}

          <ul className={styles.descriptionProduct__features}>
            {product.features.map((line) => (
              <li
                key={line}
                className={styles.descriptionProduct__featuresItem}
              >
                — {line}
              </li>
            ))}
          </ul>

          <div className={styles.descriptionProduct__notes}>
            {product.fitNotes.map((line) => (
              <p key={line} className={styles.descriptionProduct__notesLine}>
                {line}
              </p>
            ))}
          </div>

          <a href="#size-chart" className={styles.descriptionProduct__sizeChart}>
            РАЗМЕРНАЯ СЕТКА
          </a>

          <p className={styles.descriptionProduct__price}>
            {formatRub(product.price)}
          </p>

          <div className={styles.descriptionProduct__actions}>
            <select
              className={styles.descriptionProduct__select}
              value={size}
              onChange={(e) => setSize(e.target.value)}
              aria-label="Размер"
            >
              {product.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={styles.descriptionProduct__cartBtn}
              onClick={handleAddToCart}
            >
              В КОРЗИНУ
            </button>
          </div>
          {addedFlash ? (
            <p
              className="mt-2 text-[0.65rem] uppercase tracking-wide text-neutral-600"
              role="status"
            >
              Добавлено в корзину
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
