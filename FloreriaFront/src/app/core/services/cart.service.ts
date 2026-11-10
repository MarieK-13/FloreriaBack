import { computed, Injectable, signal } from '@angular/core';
import { Product } from '../../shared/models/product.model';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly cartItems = signal<CartItem[]>([]);

  readonly items = this.cartItems.asReadonly();
  readonly itemCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.quantity, 0),
  );
  readonly subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0),
  );

  addProduct(product: Product, quantity = 1): void {
    if (!product.available || quantity <= 0) {
      return;
    }

    this.cartItems.update((items) => {
      const existing = items.find((item) => item.product.id === product.id);
      const quantityToAdd = Math.min(Math.trunc(quantity), product.stock);

      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, product.stock) }
            : item,
        );
      }

      return [...items, { product, quantity: quantityToAdd }];
    });
  }

  setQuantity(productId: string, quantity: number): void {
    this.cartItems.update((items) =>
      items
        .map((item) =>
          item.product.id === productId
            ? {
                ...item,
                quantity: Math.min(Math.max(1, Math.trunc(quantity)), item.product.stock),
              }
            : item,
        )
        .filter((item) => item.product.stock > 0),
    );
  }

  removeProduct(productId: string): void {
    this.cartItems.update((items) => items.filter((item) => item.product.id !== productId));
  }

  clear(): void {
    this.cartItems.set([]);
  }
}
