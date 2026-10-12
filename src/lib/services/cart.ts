import { useHuntStore } from "@/store/hunt-store";

/**
 * Cart service — the storefront talks to the shared cart slice through here
 * so the builder, storefront and analytics all agree on what a cart is.
 */

export function addToCartAction(
  storeId: string,
  productId: string,
  quantity = 1,
): void {
  useHuntStore.getState().addToCart(storeId, productId, quantity);
}

export function setCartQuantityAction(productId: string, quantity: number): void {
  useHuntStore.getState().setCartQuantity(productId, quantity);
}

export function removeFromCartAction(productId: string): void {
  useHuntStore.getState().removeFromCart(productId);
}

export function clearCartAction(): void {
  useHuntStore.getState().clearCart();
}

export function getCartItemCount(storeId?: string): number {
  const cart = useHuntStore.getState().cart;
  return cart
    .filter((item) => (storeId ? item.storeId === storeId : true))
    .reduce((sum, item) => sum + item.quantity, 0);
}
