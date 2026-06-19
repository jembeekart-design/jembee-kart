"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";

interface CartItem {
  id: string;

  title?: string;

  image?: string;

  price?: number;

  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];

  addToCart: (
    product: CartItem
  ) => void;

  removeFromCart: (
    id: string
  ) => void;

  increaseQuantity: (
    id: string
  ) => void;

  decreaseQuantity: (
    id: string
  ) => void;

  clearCart: () => void;

  totalPrice: number;

  totalItems: number;
}

const CartContext =
  createContext<
    CartContextType | undefined
  >(undefined);

export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  /* LOAD CART */

  useEffect(() => {
    const savedCart =
      localStorage.getItem(
        "jombeekart-cart"
      );

    if (savedCart) {
      setCartItems(
        JSON.parse(savedCart)
      );
    }
  }, []);

  /* SAVE CART */

  useEffect(() => {
    localStorage.setItem(
      "jombeekart-cart",
      JSON.stringify(cartItems)
    );
  }, [cartItems]);

  /* ADD TO CART */

  function addToCart(
    product: CartItem
  ) {
    setCartItems((previous) => {
      const existingProduct =
        previous.find(
          (item) =>
            item.id ===
            product.id
        );

      if (existingProduct) {
        return previous.map(
          (item) => {
            if (
              item.id ===
              product.id
            ) {
              return {
                ...item,

                quantity:
                  item.quantity +
                  1
              };
            }

            return item;
          }
        );
      }

      return [
        ...previous,

        {
          ...product,

          quantity: 1
        }
      ];
    });
  }

  /* REMOVE */

  function removeFromCart(
    id: string
  ) {
    setCartItems((previous) => {
      return previous.filter(
        (item) =>
          item.id !== id
      );
    });
  }

  /* INCREASE */

  function increaseQuantity(
    id: string
  ) {
    setCartItems((previous) => {
      return previous.map(
        (item) => {
          if (
            item.id === id
          ) {
            return {
              ...item,

              quantity:
                item.quantity +
                1
            };
          }

          return item;
        }
      );
    });
  }

  /* DECREASE */

  function decreaseQuantity(
    id: string
  ) {
    setCartItems((previous) => {
      return previous
        .map((item) => {
          if (
            item.id === id
          ) {
            return {
              ...item,

              quantity:
                item.quantity -
                1
            };
          }

          return item;
        })
        .filter(
          (item) =>
            item.quantity > 0
        );
    });
  }

  /* CLEAR */

  function clearCart() {
    setCartItems([]);
  }

  /* TOTAL PRICE */

  const totalPrice =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(
            item.price || 0
          ) *
            item.quantity
        );
      },
      0
    );

  /* TOTAL ITEMS */

  const totalItems =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          item.quantity
        );
      },
      0
    );

  return (
    <CartContext.Provider
      value={{
        cartItems,

        addToCart,

        removeFromCart,

        increaseQuantity,

        decreaseQuantity,

        clearCart,

        totalPrice,

        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}
