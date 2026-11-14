export type ProductKind = 'product' | 'pack';

export interface Product {
  id: string;
  categoryId: string;
  category: string;
  kind: ProductKind;
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  color: string;
  size: string;
  occasion: string;
  durationDays?: number;
  materials?: string;
  care?: string;
  deliveryInstructions?: string;
  imageUrl?: string;
  tags: string[];
  badge?: string;
  components?: ProductComponent[];
  validUntil?: string;
}

export interface ProductComponent {
  quantity: number;
  description: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

export interface ProductTechnicalDetails {
  productId: string;
  durationDays: number | null;
  materials: string;
  occasion: string;
  care: string;
  deliveryInstructions: string;
}

export interface StoreCatalog {
  categories: ProductCategory[];
  products: Product[];
}
