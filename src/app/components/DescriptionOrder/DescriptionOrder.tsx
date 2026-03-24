"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatRub } from "@/lib/format";
import styles from "./DescriptionOrder.module.css";

const DELIVERY_OPTIONS = [
  { id: "pickup-msk", label: "Самовывоз в Москве", price: 0 },
  { id: "courier-msk", label: "Курьерская доставка CDEK по Москве", price: 1000 },
  {
    id: "courier-spb",
    label: "Курьерская доставка CDEK по Санкт-Петербургу",
    price: 1000,
  },
  { id: "cdek-pvz", label: "CDEK до ПВЗ", price: 600 },
  { id: "international", label: "Международная доставка", price: 2200 },
] as const;

const PAYMENT_OPTIONS = [
  { id: "card-ru", label: "Банковская карта (Россия)" },
  { id: "parts", label: "Долями" },
  { id: "split", label: "Яндекс.Сплит" },
  { id: "crypto", label: "Crypto" },
] as const;

export default function DescriptionOrder() {
  const { lines, itemCount } = useCart();
  const [deliveryId, setDeliveryId] = useState<
    (typeof DELIVERY_OPTIONS)[number]["id"]
  >(DELIVERY_OPTIONS[0].id);
  const [paymentId, setPaymentId] = useState<(typeof PAYMENT_OPTIONS)[number]["id"]>(
    PAYMENT_OPTIONS[1].id
  );

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines]
  );
  const selectedDelivery =
    DELIVERY_OPTIONS.find((o) => o.id === deliveryId) ?? DELIVERY_OPTIONS[0];

  const orderSummary =
    itemCount > 0
      ? `ОФОРМЛЕНИЕ ЗАКАЗА ${itemCount} ТОВАР${
          itemCount > 1 ? "А" : ""
        } НА СУММУ ${formatRub(subtotal).toUpperCase()}`
      : "ОФОРМЛЕНИЕ ЗАКАЗА";

  return (
    <section className={styles.descriptionOrder}>
      <div className={styles.descriptionOrder__container}>
        <p className={styles.descriptionOrder__heading}>{orderSummary}</p>

        <div className={styles.sectionTitle}>
          <span className={styles.sectionTitle__badge}>1</span>
          <h2 className={styles.sectionTitle__text}>Выберите тип доставки</h2>
        </div>

        <ul className={styles.deliveryList}>
          {DELIVERY_OPTIONS.map((option) => (
            <li key={option.id} className={styles.deliveryList__item}>
              <label className={styles.deliveryList__label}>
                <input
                  type="radio"
                  name="delivery"
                  checked={deliveryId === option.id}
                  onChange={() => setDeliveryId(option.id)}
                />
                <span>{option.label}</span>
              </label>
              <span className={styles.deliveryList__price}>
                {formatRub(option.price)}
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.sectionTitle}>
          <span className={styles.sectionTitle__badge}>2</span>
          <h2 className={styles.sectionTitle__text}>Введите данные</h2>
        </div>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.form__label}>
            Полное имя
            <input className={styles.form__input} placeholder="Ф.И.О." />
          </label>
          <label className={styles.form__label}>
            Телефон
            <input className={styles.form__input} placeholder="Например, +7 913 123 32 10" />
          </label>
          <label className={styles.form__label}>
            Email
            <input className={styles.form__input} placeholder="Email" />
          </label>
          <label className={styles.form__label}>
            О чем нам нужно знать
            <textarea className={styles.form__textarea} placeholder="Комментарий" />
          </label>
          <label className={styles.form__label}>
            Промокод
            <input className={styles.form__input} placeholder="Промо-код (если есть)" />
          </label>
        </form>

        <div className={styles.sectionTitle}>
          <span className={styles.sectionTitle__badge}>3</span>
          <h2 className={styles.sectionTitle__text}>Способы оплаты</h2>
        </div>

        <ul className={styles.paymentList}>
          {PAYMENT_OPTIONS.map((option) => (
            <li key={option.id} className={styles.paymentList__item}>
              <label className={styles.paymentList__label}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentId === option.id}
                  onChange={() => setPaymentId(option.id)}
                />
                <span>{option.label}</span>
              </label>
            </li>
          ))}
        </ul>

        <label className={styles.terms}>
          <input type="checkbox" />
          <span>
            Согласен с условиями <a href="#">публичной оферты</a>
            <br />
            Согласен на обработку моих персональных данных, с{" "}
            <a href="#">политикой конфиденциальности</a> и обработки персональных данных
            ознакомлен.
          </span>
        </label>

        <div className={styles.actions}>
          <Link href="/basket" className={styles.actions__back}>
            Вернуться назад
          </Link>
          <button type="button" className={styles.actions__next}>
            Продолжить
          </button>
        </div>

        <p className={styles.total}>
          Итого с доставкой: {formatRub(subtotal + selectedDelivery.price)}
        </p>
      </div>
    </section>
  );
}