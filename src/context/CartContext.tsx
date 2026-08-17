import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface CartItem {
  _id?: string;
  id?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  sizes?: string[];
  colors?: string[];
  stock?: number;
  category?: string;
  badge?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  cart: CartItem[]; // alias for cartItems
  addToCart: (product: any, selectedSize?: string, selectedColor?: string) => void;
  removeFromCart: (productId: string, selectedSize?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  view: 'shop' | 'checkout';
  setView: (v: 'shop' | 'checkout') => void;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'tammi_cart';

function loadCart(): CartItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
  const [view, setView] = useState<'shop' | 'checkout'>('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist to localStorage whenever cart changes
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const addToCart = useCallback((product: any, selectedSize?: string, selectedColor?: string) => {
    setCartItems((prev) => {
      const id = product._id || product.id;
      const size = selectedSize || product.selectedSize;
      const color = selectedColor || product.selectedColor;
      
      const existing = prev.find(
        (i) => (i._id || i.id) === id && i.selectedSize === size && i.selectedColor === color
      );
      
      if (existing) {
        // Check stock limit
        if (product.stock && existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map((i) =>
          (i._id || i.id) === id && i.selectedSize === size && i.selectedColor === color
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      
      return [...prev, {
        _id: product._id,
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.image,
        quantity: 1,
        selectedSize: size,
        selectedColor: color,
        sizes: product.sizes,
        colors: product.colors,
        stock: product.stock,
        category: product.category,
        badge: product.badge,
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, selectedSize?: string) => {
    setCartItems((prev) =>
      prev.filter(
        (i) => !((i._id || i.id) === productId && i.selectedSize === selectedSize)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => (i._id || i.id) !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        (i._id || i.id) === productId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (s, i) => s + (i.price || 0) * (i.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cart: cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        view,
        setView,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
