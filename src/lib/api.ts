import type {
  CartLine,
  Category,
  CategoryInput,
  Product,
  ProductInput,
  ProductListItem,
} from "./types";

export function getApiBase(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001";
  }
  return (
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:3001"
  );
}

const ADMIN_TOKEN_KEY = "mm-admin-jwt";

export function getAdminToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ADMIN_TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
}

export function clearAdminToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function adminHeaders(): HeadersInit {
  const h: Record<string, string> = {};
  const token = getAdminToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function loginAdmin(login: string, password: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message || "Ошибка входа");
  }
  const data = (await res.json()) as { token: string };
  if (!data.token) throw new Error("Сервер не вернул токен");
  setAdminToken(data.token);
}

export async function fetchAdminSession(): Promise<{ login: string; role: string }> {
  const res = await fetch(`${getApiBase()}/api/admin/me`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  if (res.status === 401) throw new Error("UNAUTHORIZED");
  if (!res.ok) throw new Error("Не удалось проверить сессию");
  const data = (await res.json()) as {
    admin: { login: string; role: string };
  };
  return data.admin;
}

export function resolveAssetUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${getApiBase()}${url}`;
}

function visitorHeaders(visitorId: string): HeadersInit {
  return { "X-Visitor-Id": visitorId };
}

export async function pingVisitor(visitorId: string): Promise<void> {
  await fetch(`${getApiBase()}/api/visitor/ping`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...visitorHeaders(visitorId),
    },
    body: JSON.stringify({}),
  });
}

export async function trackPageView(visitorId: string, path: string): Promise<void> {
  try {
    await fetch(`${getApiBase()}/api/analytics/pageview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...visitorHeaders(visitorId),
      },
      body: JSON.stringify({ path }),
    });
  } catch {
    /* offline */
  }
}

export async function fetchServerCart(visitorId: string): Promise<CartLine[]> {
  const res = await fetch(`${getApiBase()}/api/cart`, {
    cache: "no-store",
    headers: visitorHeaders(visitorId),
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { lines?: CartLine[] };
  return Array.isArray(data.lines) ? data.lines : [];
}

export async function syncServerCart(
  visitorId: string,
  lines: CartLine[]
): Promise<void> {
  await fetch(`${getApiBase()}/api/cart`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...visitorHeaders(visitorId),
    },
    body: JSON.stringify({ lines }),
  });
}

export type AdminStats = {
  visitorsTotal: number;
  uniqueVisitors24h: number;
  pageViews24h: number;
  pageViewsTotal: number;
  cartsWithItems: number;
  recentPageViews: { id: number; visitorId: string; path: string; createdAt: string }[];
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${getApiBase()}/api/admin/stats`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Не удалось загрузить статистику");
  return res.json();
}

export type AdminVisitorRow = {
  visitorId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  userAgent: string | null;
  cartLines: number;
  cartTotalRub: number;
};

export async function fetchAdminVisitors(): Promise<AdminVisitorRow[]> {
  const res = await fetch(`${getApiBase()}/api/admin/visitors`, {
    cache: "no-store",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Не удалось загрузить посетителей");
  const data = (await res.json()) as { visitors: AdminVisitorRow[] };
  return data.visitors ?? [];
}

export async function fetchAdminVisitorCart(visitorId: string) {
  const res = await fetch(
    `${getApiBase()}/api/admin/visitors/${encodeURIComponent(visitorId)}/cart`,
    { cache: "no-store", headers: adminHeaders() }
  );
  if (!res.ok) throw new Error("Не удалось загрузить корзину");
  return res.json() as Promise<{
    visitor: {
      id: string;
      firstSeenAt: string;
      lastSeenAt: string;
      userAgent: string | null;
    };
    lines: CartLine[];
  }>;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${getApiBase()}/api/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Не удалось загрузить категории");
  return res.json();
}

export async function createCategory(payload: CategoryInput): Promise<Category> {
  const res = await fetch(`${getApiBase()}/api/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Ошибка создания");
  }
  return res.json();
}

export async function updateCategory(
  id: string,
  payload: Partial<Omit<CategoryInput, "id">>
): Promise<Category> {
  const res = await fetch(`${getApiBase()}/api/categories/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message || "Ошибка сохранения");
  }
  return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/categories/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Не удалось удалить категорию");
}

export async function fetchProducts(categoryId?: string | null): Promise<ProductListItem[]> {
  const q =
    categoryId && categoryId.trim()
      ? `?category=${encodeURIComponent(categoryId.trim())}`
      : "";
  const res = await fetch(`${getApiBase()}/api/products${q}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Не удалось загрузить каталог");
  }
  return res.json();
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error("Не удалось загрузить товар");
  }
  return res.json();
}

export async function createProduct(payload: ProductInput): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Не удалось добавить товар");
  return res.json();
}

export async function updateProduct(
  id: string,
  payload: ProductInput
): Promise<Product> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...adminHeaders() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Не удалось обновить товар");
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  const res = await fetch(`${getApiBase()}/api/products/${id}`, {
    method: "DELETE",
    headers: adminHeaders(),
  });
  if (!res.ok) throw new Error("Не удалось удалить товар");
}

export async function uploadProductImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("image", file);
  const res = await fetch(`${getApiBase()}/api/uploads`, {
    method: "POST",
    headers: adminHeaders(),
    body,
  });
  if (!res.ok) throw new Error("Не удалось загрузить фото");
  const data = (await res.json()) as { url: string };
  return data.url;
}
