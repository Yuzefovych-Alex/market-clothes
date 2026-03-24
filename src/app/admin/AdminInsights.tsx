"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminStats,
  fetchAdminVisitorCart,
  fetchAdminVisitors,
  type AdminStats,
  type AdminVisitorRow,
} from "@/lib/api";
import { formatRub } from "@/lib/format";
import styles from "./page.module.css";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function AdminInsights() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [visitors, setVisitors] = useState<AdminVisitorRow[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Awaited<
    ReturnType<typeof fetchAdminVisitorCart>
  > | null>(null);

  const load = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const [s, v] = await Promise.all([fetchAdminStats(), fetchAdminVisitors()]);
      setStats(s);
      setVisitors(v);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function openDetail(id: string) {
    setDetailId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const data = await fetchAdminVisitorCart(id);
      setDetail(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setDetailLoading(false);
    }
  }

  if (loading && !stats) {
    return <p className={styles.muted}>Загрузка аналитики...</p>;
  }

  return (
    <div className={styles.insights}>
      {error ? (
        <div className={styles.insights__banner}>
          <p className={styles.insights__error}>{error}</p>
          <p className={styles.muted}>
            Возможно, токен истёк. Выйдите и войдите в админ-панель снова.
          </p>
        </div>
      ) : null}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statCard__label}>Посетителей (всего)</span>
          <span className={styles.statCard__value}>{stats?.visitorsTotal ?? "—"}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCard__label}>Уникальных за 24ч</span>
          <span className={styles.statCard__value}>
            {stats?.uniqueVisitors24h ?? "—"}
          </span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCard__label}>Просмотров за 24ч</span>
          <span className={styles.statCard__value}>{stats?.pageViews24h ?? "—"}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCard__label}>Просмотров (всего)</span>
          <span className={styles.statCard__value}>{stats?.pageViewsTotal ?? "—"}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statCard__label}>Корзин с товарами</span>
          <span className={styles.statCard__value}>{stats?.cartsWithItems ?? "—"}</span>
        </div>
      </div>

      <div className={styles.insights__toolbar}>
        <button type="button" className={styles.buttonGhost} onClick={() => void load()}>
          Обновить данные
        </button>
      </div>

      <div className={styles.insights__split}>
        <div className={styles.insights__tableWrap}>
          <h3 className={styles.insights__h3}>Посетители и корзины</h3>
          <div className={styles.tableScroll}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Был онлайн</th>
                  <th>Позиций</th>
                  <th>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr
                    key={v.visitorId}
                    className={
                      detailId === v.visitorId ? styles.dataTable__row_active : undefined
                    }
                  >
                    <td>
                      <button
                        type="button"
                        className={styles.linkBtn}
                        onClick={() => void openDetail(v.visitorId)}
                        title={v.visitorId}
                      >
                        {v.visitorId.slice(0, 8)}…
                      </button>
                    </td>
                    <td>{fmtDate(v.lastSeenAt)}</td>
                    <td>{v.cartLines}</td>
                    <td>{formatRub(v.cartTotalRub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.insights__detail}>
          <h3 className={styles.insights__h3}>Детали корзины</h3>
          {detailLoading ? (
            <p className={styles.muted}>Загрузка...</p>
          ) : detail ? (
            <>
              <p className={styles.muted}>
                <strong>ID:</strong> {detail.visitor.id}
              </p>
              <p className={styles.muted}>
                First seen: {fmtDate(detail.visitor.firstSeenAt)} · Last:{" "}
                {fmtDate(detail.visitor.lastSeenAt)}
              </p>
              {detail.visitor.userAgent ? (
                <p className={styles.insights__ua}>{detail.visitor.userAgent}</p>
              ) : null}
              {detail.lines.length === 0 ? (
                <p className={styles.muted}>Корзина пуста</p>
              ) : (
                <ul className={styles.cartDetail}>
                  {detail.lines.map((line) => (
                    <li key={line.lineId} className={styles.cartDetail__item}>
                      <span className={styles.cartDetail__title}>{line.title}</span>
                      <span className={styles.muted}>
                        {line.size} × {line.quantity} — {formatRub(line.price * line.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className={styles.muted}>Выберите посетителя в таблице</p>
          )}
        </div>
      </div>

      <div className={styles.insights__recent}>
        <h3 className={styles.insights__h3}>Последние просмотры страниц</h3>
        <div className={styles.tableScroll}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Время</th>
                <th>Посетитель</th>
                <th>Путь</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentPageViews ?? []).map((pv) => (
                <tr key={pv.id}>
                  <td>{fmtDate(pv.createdAt)}</td>
                  <td className={styles.dataTable__mono}>{pv.visitorId.slice(0, 8)}…</td>
                  <td>{pv.path}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
