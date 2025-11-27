"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

export default function CartPopup() {
  const { items, totalQty, totalPrice, addItem, removeItem, clearCart } =
    useCartStore();

  const [open, setOpen] = useState(false);

  // === EVENT BUKA / TUTUP POPUP ===
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

  // Body lock SAFE (tidak ganggu scroll cart)
  useEffect(() => {
    if (open) document.body.classList.add("body-cart-lock");
    else document.body.classList.remove("body-cart-lock");
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="koje-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Keranjang Belanja"
      onClick={() => setOpen(false)}
    >
      <div
        className="
          koje-modal-box
          max-h-[85vh] w-[92%] sm:w-[420px]
          overflow-y-auto smooth-scroll
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#0B4B50]">Keranjang Belanja</h2>
          <button aria-label="Tutup keranjang" onClick={() => setOpen(false)}>
            <X className="text-[#0B4B50]" size={26} />
          </button>
        </div>

        {/* LIST PRODUK */}
        <div className="divide-y divide-gray-200 px-5">
          {items.length === 0 && (
            <p className="py-10 text-center text-gray-500">Keranjang kosong</p>
          )}

          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-4">
              <img
                src={item.img}
                alt={item.name}
                loading="lazy"
                className="w-16 h-16 rounded-md object-cover"
              />

              <div className="flex-1">
                <p className="font-medium text-[#0B4B50]">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>

                {/* QTY */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    aria-label="Kurangi jumlah"
                    onClick={() => removeItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 text-gray-600"
                  >
                    -
                  </button>

                  <span className="min-w-[26px] text-center font-semibold">
                    {item.qty}
                  </span>

                  <button
                    aria-label="Tambah jumlah"
                    onClick={() =>
                      addItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        img: item.img,
                      })
                    }
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#0FA3A8] text-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 space-y-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                window.dispatchEvent(new CustomEvent("open-checkout"));
              }}
              className="w-full py-3 bg-[#0FA3A8] text-white rounded-xl font-semibold mt-1 hover:bg-[#0B4B50] transition-all"
            >
              Checkout
            </button>

            <button
              onClick={clearCart}
              className="block text-center text-sm text-gray-500 underline"
            >
              Kosongkan Keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
