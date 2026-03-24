"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchProducts, getApiBase, resolveAssetUrl } from "@/lib/api";
import type { ProductListItem } from "@/lib/types";
import { formatRub } from "@/lib/format";
import styles from "./ListGoods.module.css";

export default function ListGoods() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [items, setItems] = useState<ProductListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchProducts(category);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error ? e.message : "Ошибка загрузки. Запустите API."
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [category]);

  if (error) {
    return (
      <div className={styles.listGoods}>
        <div className={styles.listGoods__container}>
          <p className={styles.listGoods__error}>{error}</p>
          <p className={styles.listGoods__hint}>
            Сервер: <code className={styles.listGoods__code}>{getApiBase()}</code>{" "}
            — выполните в папке <code className={styles.listGoods__code}>server</code>:{" "}
            <code className={styles.listGoods__code}>npm run dev</code>
          </p>
        </div>
      </div>
    );
  }

  if (!items) {
    return (
      <div className={styles.listGoods}>
        <div className={styles.listGoods__container}>
          <p className={styles.listGoods__loading}>Загрузка…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.listGoods}>
      <div className={styles.listGoods__container}>
        {category ? (
          <p className={styles.listGoods__filter}>
            <Link href="/" className={styles.listGoods__filterLink}>
              Все товары
            </Link>
            <span className={styles.listGoods__filterSep}> · </span>
            <span>фильтр по категории</span>
          </p>
        ) : null}
        {items.length === 0 ? (
          <p className={styles.listGoods__empty}>В этой категории пока нет товаров.</p>
        ) : (
          <ul className={styles.listGoods__container__list}>
            {items.map((p) => (
              <li
                key={p.id}
                className={styles.listGoods__container__list__item}
              >
                <Link
                  href={`/products/${p.id}`}
                  className={styles.listGoods__link}
                >
                  <div className={styles.listGoods__imageWrap}>
                    <div
                      className={styles.listGoods__container__list__item__image}
                      style={{
                        backgroundColor: p.imageColor ?? "#000",
                        backgroundImage: p.imageUrl
                          ? `url("${resolveAssetUrl(p.imageUrl)}")`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    {p.isSoldOut ? (
                      <span className={styles.listGoods__soldTag}>Продано</span>
                    ) : null}
                  </div>
                  <div
                    className={styles.listGoods__container__list__item__description}
                  >
                    <div
                      className={
                        styles.listGoods__container__list__item__description__title
                      }
                    >
                      {p.title}
                    </div>
                    <div
                      className={
                        styles.listGoods__container__list__item__description__price
                      }
                    >
                      {formatRub(p.price)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
