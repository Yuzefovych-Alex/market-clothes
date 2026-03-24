export type Category = {
  id: string;
  title: string;
  sortOrder: number;
  linkHref: string | null;
};

export type ProductListItem = {
  id: string;
  categoryId?: string | null;
  title: string;
  price: number;
  currency: string;
  imageColor?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isSoldOut?: boolean;
};

export type Product = ProductListItem & {
  sizes: string[];
  features: string[];
  fitNotes: string[];
};

export type ProductInput = {
  title: string;
  price: number;
  currency: string;
  imageColor?: string;
  imageUrl?: string;
  imageUrls?: string[];
  isSoldOut?: boolean;
  categoryId?: string | null;
  sizes: string[];
  features: string[];
  fitNotes: string[];
};

export type CategoryInput = {
  id: string;
  title: string;
  sortOrder: number;
  linkHref?: string | null;
};

export type CartLine = {
  lineId: string;
  productId: string;
  title: string;
  price: number;
  size: string;
  quantity: number;
  imageColor?: string;
  imageUrl?: string;
};
