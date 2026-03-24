"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { fetchCategories } from "@/lib/api";
import type { Category } from "@/lib/types";
import styles from "./Menu.module.css";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function Menu() {
  const { itemCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchCategories();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const label =
    mounted && itemCount > 0 ? `КОРЗИНА ${itemCount}` : "КОРЗИНА";

  return (
    <div className={styles.menu}>
      <div className={styles.menu__container}>
        <h3 className={styles.menu__container__title}>MARCELO MIRACLES</h3>
        <Link href="/basket" className={styles.menu__container__basket}>
          {label}
        </Link>
        <ul className={styles.menu__container__list}>
          {categories.map((c) => {
            const isActive = !c.linkHref && activeCategory === c.id;
            const className = `${styles.menu__navLink}${isActive ? ` ${styles.menu__navLink_active}` : ""}`;

            if (c.linkHref) {
              if (isExternal(c.linkHref)) {
                return (
                  <li key={c.id} className={styles.menu__container__list__item}>
                    <a
                      href={c.linkHref}
                      className={styles.menu__navLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {c.title}
                    </a>
                  </li>
                );
              }
              return (
                <li key={c.id} className={styles.menu__container__list__item}>
                  <Link href={c.linkHref} className={styles.menu__navLink}>
                    {c.title}
                  </Link>
                </li>
              );
            }

            return (
              <li key={c.id} className={styles.menu__container__list__item}>
                <Link href={`/?category=${encodeURIComponent(c.id)}`} className={className}>
                  {c.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
