"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/lib/api";
import type { Category, CategoryInput } from "@/lib/types";
import styles from "./page.module.css";

export function AdminCategories() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryInput>({
    id: "",
    title: "",
    sortOrder: 100,
    linkHref: null,
  });

  async function load() {
    const data = await fetchCategories();
    setItems(data);
  }

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function startCreate() {
    setEditingId("new");
    setForm({ id: "", title: "", sortOrder: (items[items.length - 1]?.sortOrder ?? 0) + 10, linkHref: null });
    setStatus("");
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setForm({
      id: c.id,
      title: c.title,
      sortOrder: c.sortOrder,
      linkHref: c.linkHref,
    });
    setStatus("");
  }

  function cancelEdit() {
    setEditingId(null);
    setStatus("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      if (editingId === "new") {
        await createCategory(form);
        setStatus("Категория создана");
      } else if (editingId) {
        await updateCategory(editingId, {
          title: form.title,
          sortOrder: form.sortOrder,
          linkHref: form.linkHref,
        });
        setStatus("Сохранено");
      }
      await load();
      setEditingId(null);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить категорию? Товары останутся без категории.")) return;
    setSaving(true);
    setStatus("");
    try {
      await deleteCategory(id);
      await load();
      if (editingId === id) setEditingId(null);
      setStatus("Удалено");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Ошибка удаления");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className={styles.muted}>Загрузка категорий...</p>;
  }

  return (
    <div className={styles.categories}>
      <div className={styles.categories__toolbar}>
        <button type="button" className={styles.buttonPrimary} onClick={startCreate}>
          + Новая категория
        </button>
      </div>

      {(editingId === "new" || (editingId && editingId !== "new")) && (
        <form className={styles.categories__form} onSubmit={handleSubmit}>
          {editingId === "new" ? (
            <label className={styles.label}>
              ID (slug, латиница)
              <input
                className={styles.input}
                value={form.id}
                onChange={(e) =>
                  setForm((s) => ({ ...s, id: e.target.value.toLowerCase() }))
                }
                placeholder="например summer-sale"
                required
              />
            </label>
          ) : (
            <p className={styles.muted}>
              ID: <strong>{form.id}</strong> (не меняется)
            </p>
          )}
          <label className={styles.label}>
            Название в меню
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
              required
            />
          </label>
          <label className={styles.label}>
            Порядок (меньше — выше в списке)
            <input
              className={styles.input}
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((s) => ({ ...s, sortOrder: Number(e.target.value) }))
              }
            />
          </label>
          <label className={styles.label}>
            Ссылка вместо фильтра (опционально)
            <input
              className={styles.input}
              value={form.linkHref ?? ""}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  linkHref: e.target.value.trim() || null,
                }))
              }
              placeholder="/страница или https://…"
            />
          </label>
          <div className={styles.form__actions}>
            <button type="submit" className={styles.buttonPrimary} disabled={saving}>
              {editingId === "new" ? "Создать" : "Сохранить"}
            </button>
            <button type="button" className={styles.buttonGhost} onClick={cancelEdit}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableScroll}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Порядок</th>
              <th>ID</th>
              <th>Название</th>
              <th>Ссылка</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.sortOrder}</td>
                <td className={styles.dataTable__mono}>{c.id}</td>
                <td>{c.title}</td>
                <td className={styles.muted}>{c.linkHref || "—"}</td>
                <td>
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => startEdit(c)}
                  >
                    Изменить
                  </button>{" "}
                  <button
                    type="button"
                    className={styles.linkBtn}
                    onClick={() => void handleDelete(c.id)}
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {status ? <p className={styles.status}>{status}</p> : null}
    </div>
  );
}
