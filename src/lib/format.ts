export function formatRub(price: number): string {
  return `${price.toLocaleString("ru-RU")} руб.`;
}
