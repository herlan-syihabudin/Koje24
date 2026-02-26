"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { X, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/stores/cartStore";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";

// Safe event dispatcher
const dispatchEvent = (eventName: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(eventName));
  } catch (error) {
    console.warn(`Failed to dispatch ${eventName}:`, error);
  }
};

// SPLIT COMPONENT: Cart Item dengan React.memo
const CartItem = React.memo(({ item, onAdd, onRemove }) => {
  const [imgError, setImgError] = useState(false);
  const { title, detail } = formatName(item.name);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-4 items-center"
    >
      <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={imgError ? "/images/no-image.jpg" : item.img || "/images/no-image.jpg"}
          alt={item.name}
          fill
          sizes="56px"
          className="object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#0B4B50] leading-snug truncate">
              {title}
            </p>
            {detail && (
              <p className="text-xs text-gray-500 leading-tight mt-0.5 truncate">
                {detail}
              </p>
            )}
          </div>
          <p className="font-semibold text-[#0B4B50] whitespace-nowrap ml-2">
            Rp {(item.qty * item.price).toLocaleString("id-ID")}
          </p>
        </div>

        <div className="flex justify-between items-center mt-1">
          <p className="text-sm text-gray-500">
            Rp {item.price.toLocaleString("id-ID")}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRemove(item.id)}
              className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Kurangi jumlah"
            >
              -
            </button>

            <span className="min-w-[24px] text-center font-semibold">
              {item.qty}
            </span>

            <button
              onClick={() => onAdd(item)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#0FA3A8] text-white hover:bg-[#0B4B50] transition-colors"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

CartItem.displayName = 'CartItem';

// MAIN COMPONENT
export default function CartPopup() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => setMounted(true), []);

  // Cart store - SELECT ONLY WHAT YOU NEED
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const promo = useCartStore((s) => s.promo);
  const getDiscount = useCartStore((s) => s.getDiscount);
  const getFinalTotal = useCartStore((s) => s.getFinalTotal);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearPromo = useCartStore((s) => s.clearPromo);

  // Event listeners
  useEffect(() => {
    const openEvent = () => setOpen(true);
    const closeEvent = () => setOpen(false);

    window.addEventListener("open-cart", openEvent);
    window.addEventListener("close-cart", closeEvent);
    
    return () => {
      window.removeEventListener("open-cart", openEvent);
      window.removeEventListener("close-cart", closeEvent);
    };
  }, []);

  // Body lock
  useEffect(() => {
    if (!mounted) return;
    document.body.classList.toggle("body-cart-lock", open);
    return () => document.body.classList.remove("body-cart-lock");
  }, [open, mounted]);

  // ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        dispatchEvent("close-cart");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Handlers
  const handleClose = useCallback(() => {
    setOpen(false);
    dispatchEvent("close-cart");
  }, []);

  const handleCheckout = useCallback(() => {
    if (items.length === 0) return;
    handleClose();
    router.push("/checkout");
  }, [items.length, handleClose, router]);

  const handleStartShopping = useCallback(() => {
    handleClose();
    const produkSection = document.getElementById('produk');
    if (produkSection) {
      produkSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handleClose]);

  // Computed values
  const discount = useMemo(() => getDiscount(), [getDiscount]);
  const finalTotal = useMemo(() => getFinalTotal(), [getFinalTotal]);

  if (!mounted) return null;

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="koje-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Keranjang Belanja"
          onMouseDown={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="koje-modal-box w-[92%] sm:w-[420px] max-w-[480px] max-h-[85vh] overflow-y-auto smooth-scroll"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold text-[#0B4B50]">
                Keranjang Belanja {items.length > 0 && `(${items.length})`}
              </h2>
              <button
                aria-label="Tutup keranjang"
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="text-[#0B4B50]" size={24} />
              </button>
            </div>

            {/* LIST - PAKE REACT.MEMO COMPONENT */}
            <div className="divide-y divide-gray-200 px-5">
              {items.length === 0 ? (
                <div className="py-12 text-center">
                  <ShoppingBag size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 mb-4">Keranjang belanja masih kosong</p>
                  <button
                    onClick={handleStartShopping}
                    className="bg-[#0FA3A8] text-white px-6 py-2 rounded-full hover:bg-[#0B4B50] transition-colors"
                  >
                    Mulai Belanja
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onAdd={addItem}
                    onRemove={removeItem}
                  />
                ))
              )}
            </div>

            {/* FOOTER */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-200 space-y-3 sticky bottom-0 bg-white">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>

                {promo && discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Promo {promo.kode}</span>
                    <span>- Rp {discount.toLocaleString("id-ID")}</span>
                  </div>
                )}

                {promo && (
                  <button
                    onClick={clearPromo}
                    className="text-xs text-red-500 hover:text-red-700 underline transition-colors"
                  >
                    Hapus promo
                  </button>
                )}

                <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#0FA3A8]">
                    Rp {finalTotal.toLocaleString("id-ID")}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-[#0FA3A8] text-white rounded-xl font-semibold hover:bg-[#0B4B50] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Checkout
                </button>

                <button
                  onClick={clearCart}
                  className="block text-center text-sm text-gray-400 hover:text-gray-600 underline transition-colors w-full"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// FORMAT NAME FUNCTION (dipindah ke luar)
const formatName = (name: string) => {
  const patterns = [
    /^(.*?)\s+[—–-]\s+\[(.*)\]$/,
    /^(.*?)\s+[—–-]\s+(.*)$/,
    /^(.*?)\s+\[(.*)\]$/,
  ];

  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match) {
      return {
        title: match[1].trim(),
        detail: match[2].replace(/,/g, ' •').trim()
      };
    }
  }

  return { title: name, detail: null };
};
