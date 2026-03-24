"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/lib/api";
import type { Category } from "@/lib/types";
import styles from "./MobileMenu.module.css";

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={styles.mobileMenu__toggle}
        aria-label="Открыть меню"
        onClick={() => setOpen(true)}
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <div className={styles.mobileMenu__overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.mobileMenu__panel}
            role="dialog"
            aria-modal="true"
            aria-label="Меню"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.mobileMenu__close}
              aria-label="Закрыть меню"
              onClick={() => setOpen(false)}
            >
              <span />
              <span />
            </button>

            <p className={styles.mobileMenu__brand}>MARCELO MIRACLES</p>

            <ul className={styles.mobileMenu__list}>
              {categories.map((category) => (
                <li key={category.id} className={styles.mobileMenu__item}>
                  {category.linkHref ? (
                    isExternal(category.linkHref) ? (
                      <a
                        href={category.linkHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mobileMenu__link}
                        onClick={() => setOpen(false)}
                      >
                        {category.title}
                      </a>
                    ) : (
                      <Link
                        href={category.linkHref}
                        className={styles.mobileMenu__link}
                        onClick={() => setOpen(false)}
                      >
                        {category.title}
                      </Link>
                    )
                  ) : (
                    <Link
                      href={`/?category=${encodeURIComponent(category.id)}`}
                      className={styles.mobileMenu__link}
                      onClick={() => setOpen(false)}
                    >
                      {category.title}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
