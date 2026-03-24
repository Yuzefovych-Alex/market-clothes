"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  fetchProduct,
  resolveAssetUrl,
  uploadProductImage,
  updateProduct,
} from "@/lib/api";
import type { Category, Product, ProductInput, ProductListItem } from "@/lib/types";
import { formatRub } from "@/lib/format";
import styles from "./page.module.css";

const EMPTY_FORM: ProductInput = {
  title: "",
  price: 0,
  currency: "RUB",
  imageColor: "#e8e8e8",
  imageUrl: "",
  imageUrls: [],
  isSoldOut: false,
  categoryId: null,
  sizes: ["S", "M"],
  features: [],
  fitNotes: [],
};

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function AdminCatalog() {
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(EMPTY_FORM);
  const [sizesText, setSizesText] = useState("S, M");
  const [featuresText, setFeaturesText] = useState("");
  const [fitNotesText, setFitNotesText] = useState("");
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const previewUrls = useMemo(() => {
    const fromForm = form.imageUrls ?? [];
    if (fromForm.length > 0) return fromForm;
    const fromText = splitLines(imageUrlsText);
    if (fromText.length > 0) return fromText;
    return form.imageUrl ? [form.imageUrl] : [];
  }, [form.imageUrls, form.imageUrl, imageUrlsText]);

  const selectedLabel = useMemo(() => {
    const found = items.find((p) => p.id === selectedId);
    return found ? `${found.title} (${found.id})` : "Новый товар";
  }, [items, selectedId]);

  async function loadProducts() {
    const data = await fetchProducts();
    setItems(data);
  }

  async function handleSelect(id: string) {
    setSelectedId(id);
    setStatus("");
    const product = await fetchProduct(id);
    if (!product) return;
    hydrateForm(product);
  }

  function hydrateForm(product: Product) {
    setForm({
      title: product.title,
      price: product.price,
      currency: product.currency,
      imageColor: product.imageColor ?? "#e8e8e8",
      imageUrl: product.imageUrl ?? "",
      imageUrls:
        product.imageUrls && product.imageUrls.length > 0
          ? product.imageUrls
          : product.imageUrl
            ? [product.imageUrl]
            : [],
      isSoldOut: Boolean(product.isSoldOut),
      categoryId: product.categoryId ?? null,
      sizes: product.sizes,
      features: product.features,
      fitNotes: product.fitNotes,
    });
    setSizesText(product.sizes.join(", "));
    setFeaturesText(product.features.join("\n"));
    setFitNotesText(product.fitNotes.join("\n"));
    setImageUrlsText(
      (product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls
        : product.imageUrl
          ? [product.imageUrl]
          : []
      ).join("\n")
    );
  }

  function resetForm() {
    setSelectedId(null);
    setForm(EMPTY_FORM);
    setSizesText("S, M");
    setFeaturesText("");
    setFitNotesText("");
    setImageUrlsText("");
    setStatus("");
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (!cancelled) setCategories(cats);
      } catch {
        /* категории опциональны */
      }
      try {
        await loadProducts();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    const payload: ProductInput = {
      ...form,
      sizes: sizesText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      features: splitLines(featuresText),
      fitNotes: splitLines(fitNotesText),
      imageUrls: splitLines(imageUrlsText),
      isSoldOut: Boolean(form.isSoldOut),
    };
    try {
      if (selectedId) {
        await updateProduct(selectedId, payload);
        setStatus("Товар обновлен");
      } else {
        const created = await createProduct(payload);
        setStatus(`Товар добавлен: ${created.id}`);
        setSelectedId(created.id);
      }
      await loadProducts();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    setSaving(true);
    setStatus("");
    try {
      await deleteProduct(selectedId);
      await loadProducts();
      resetForm();
      setStatus("Товар удален");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setStatus("");
    try {
      const url = await uploadProductImage(file);
      setForm((s) => ({
        ...s,
        imageUrl: s.imageUrl || url,
        imageUrls: [...(s.imageUrls ?? []), url],
      }));
      setImageUrlsText((prev) => (prev ? `${prev}\n${url}` : url));
      setStatus("Фото загружено");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ошибка загрузки фото");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className={styles.admin__layout}>
      <aside className={styles.admin__sidebar}>
        <button type="button" className={styles.buttonGhost} onClick={resetForm}>
          + Новый товар
        </button>
        {loading ? (
          <p className={styles.muted}>Загрузка...</p>
        ) : (
          <ul className={styles.productList}>
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`${styles.productList__btn} ${
                    selectedId === item.id ? styles.productList__btn_active : ""
                  } ${item.isSoldOut ? styles.productList__btn_sold : ""}`}
                  onClick={() => handleSelect(item.id)}
                >
                  <span>{item.title}</span>
                  <span>{item.isSoldOut ? "ПРОДАНО · " : ""}{formatRub(item.price)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className={styles.admin__editor}>
        <p className={styles.admin__context}>
          Редактирование: <strong>{selectedLabel}</strong>
        </p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            Название
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </label>

          <label className={styles.label}>
            Категория
            <select
              className={styles.input}
              value={form.categoryId ?? ""}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  categoryId: e.target.value || null,
                }))
              }
            >
              <option value="">Без категории</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.form__row}>
            <label className={styles.label}>
              Цена
              <input
                className={styles.input}
                type="number"
                min={1}
                value={form.price || ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, price: Number(e.target.value) }))
                }
                required
              />
            </label>
            <label className={styles.label}>
              Валюта
              <input
                className={styles.input}
                value={form.currency}
                onChange={(e) =>
                  setForm((s) => ({ ...s, currency: e.target.value.toUpperCase() }))
                }
                required
              />
            </label>
            <label className={styles.label}>
              Цвет карточки
              <input
                className={styles.input}
                value={form.imageColor ?? ""}
                onChange={(e) =>
                  setForm((s) => ({ ...s, imageColor: e.target.value }))
                }
                placeholder="#e8e8e8"
              />
            </label>
            <label className={styles.label}>
              Статус
              <select
                className={styles.input}
                value={form.isSoldOut ? "sold" : "active"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    isSoldOut: e.target.value === "sold",
                  }))
                }
              >
                <option value="active">В наличии</option>
                <option value="sold">Продано</option>
              </select>
            </label>
          </div>

          <label className={styles.label}>
            Фото товара (URL или загрузка)
            <input
              className={styles.input}
              value={form.imageUrl ?? ""}
              onChange={(e) =>
                setForm((s) => ({ ...s, imageUrl: e.target.value }))
              }
              placeholder="/uploads/example.jpg"
            />
          </label>
          <label className={styles.label}>
            Все фото товара (по одному URL в строке)
            <textarea
              className={styles.textarea}
              rows={4}
              value={imageUrlsText}
              onChange={(e) => {
                setImageUrlsText(e.target.value);
                const urls = splitLines(e.target.value);
                setForm((s) => ({
                  ...s,
                  imageUrls: urls,
                  imageUrl: urls[0] ?? "",
                }));
              }}
              placeholder="/uploads/photo-1.jpg&#10;/uploads/photo-2.jpg"
            />
          </label>
          <div className={styles.form__actions}>
            <label className={styles.buttonGhost}>
              Загрузить одно фото
              <input
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleUpload(file);
                  e.currentTarget.value = "";
                }}
                disabled={uploading || saving}
              />
            </label>
            <label className={styles.buttonGhost}>
              Загрузить несколько фото
              <input
                type="file"
                accept="image/*"
                multiple
                className={styles.fileInput}
                onChange={async (e) => {
                  const files = Array.from(e.target.files ?? []);
                  if (!files.length) return;
                  setUploading(true);
                  setStatus("");
                  try {
                    const uploaded: string[] = [];
                    for (const f of files) {
                      const url = await uploadProductImage(f);
                      uploaded.push(url);
                    }
                    setForm((s) => {
                      const merged = [...(s.imageUrls ?? []), ...uploaded];
                      return {
                        ...s,
                        imageUrls: merged,
                        imageUrl: merged[0] ?? s.imageUrl,
                      };
                    });
                    setImageUrlsText((prev) => {
                      const joined = uploaded.join("\n");
                      return prev ? `${prev}\n${joined}` : joined;
                    });
                    setStatus(`Загружено фото: ${uploaded.length}`);
                  } catch (error) {
                    setStatus(
                      error instanceof Error ? error.message : "Ошибка загрузки фото"
                    );
                  } finally {
                    setUploading(false);
                    e.currentTarget.value = "";
                  }
                }}
                disabled={uploading || saving}
              />
            </label>
            {uploading ? <span className={styles.muted}>Загрузка...</span> : null}
          </div>
          {previewUrls.length > 0 ? (
            <div className={styles.previewGroup}>
              <div
                className={styles.preview}
                style={{
                  backgroundImage: `url("${resolveAssetUrl(previewUrls[0])}")`,
                }}
              />
              {previewUrls.length > 1 ? (
                <ul className={styles.previewThumbs}>
                  {previewUrls.map((url, idx) => (
                    <li key={`${url}-${idx}`} className={styles.previewThumbItem}>
                      <span
                        className={styles.previewThumb}
                        style={{ backgroundImage: `url("${resolveAssetUrl(url)}")` }}
                        title={`Фото ${idx + 1}`}
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <label className={styles.label}>
            Размеры (через запятую)
            <input
              className={styles.input}
              value={sizesText}
              onChange={(e) => setSizesText(e.target.value)}
              placeholder="XS, S, M, L"
              required
            />
          </label>

          <label className={styles.label}>
            Особенности (каждая с новой строки)
            <textarea
              className={styles.textarea}
              rows={4}
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
            />
          </label>

          <label className={styles.label}>
            Notes по посадке (каждая с новой строки)
            <textarea
              className={styles.textarea}
              rows={3}
              value={fitNotesText}
              onChange={(e) => setFitNotesText(e.target.value)}
            />
          </label>

          <div className={styles.form__actions}>
            <button type="submit" className={styles.buttonPrimary} disabled={saving}>
              {selectedId ? "Сохранить изменения" : "Добавить товар"}
            </button>
            <button
              type="button"
              className={styles.buttonDanger}
              onClick={handleDelete}
              disabled={!selectedId || saving}
            >
              Удалить товар
            </button>
          </div>

          {status ? <p className={styles.status}>{status}</p> : null}
        </form>
      </section>
    </div>
  );
}
