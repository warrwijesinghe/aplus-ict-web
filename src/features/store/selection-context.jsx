import { createContext, useContext, useEffect, useMemo, useState } from 'react';
const SelectionContext = createContext(null);
const storageKey = 'aplus-order-selection';
const initial = () => {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
  } catch {
    return [];
  }
};
export const OrderSelectionProvider = ({ children }) => {
  const [items, setItems] = useState(initial);
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items]);
  const value = useMemo(
    () => ({
      items,
      add: (product) =>
        setItems((current) => {
          const existing = current.find((item) => item.productId === product.id);
          return existing
            ? current.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: Math.min(20, item.quantity + 1) }
                  : item
              )
            : [...current, { productId: product.id, name: product.name, quantity: 1 }];
        }),
      update: (productId, quantity) =>
        setItems((current) =>
          current.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.max(1, Math.min(20, Number(quantity) || 1)) }
              : item
          )
        ),
      remove: (productId) =>
        setItems((current) => current.filter((item) => item.productId !== productId)),
      clear: () => setItems([])
    }),
    [items]
  );
  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};
// eslint-disable-next-line react-refresh/only-export-components
export const useOrderSelection = () => useContext(SelectionContext);
