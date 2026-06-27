"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X } from "lucide-react";
import TulisTestimoniForm from "./TulisTestimoniForm";

// Types
interface Transaksi {
  Nama: string;
  Tanggal: string;
}

interface Testimonial {
  nama: string;
  active: string | boolean;
}

const POPUP_KEY = "koje24_testi_popup_last";
const THREE_DAYS = 1000 * 60 * 60 * 24 * 3;
const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7;

export default function RatingPopup() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Check if popup should show
  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const checkPopupEligibility = async () => {
      try {
        // 1. Check localStorage cooldown
        const last = localStorage.getItem(POPUP_KEY);
        if (last) {
          const lastTime = new Date(last).getTime();
          const diff = Date.now() - lastTime;
          if (diff < THREE_DAYS) {
            setLoading(false);
            return;
          }
        }

        // 2. Fetch transactions
        const transRes = await fetch("/api/transaksi", { 
          signal: controller.signal,
          cache: "no-store" 
        });
        
        if (!transRes.ok) throw new Error("Failed to fetch transactions");
        const transactions = await transRes.json() as Transaksi[];

        // Sort by newest first
        const sorted = [...transactions].reverse();

        // Find transaction older than 7 days
        const eligibleTransaction = sorted.find((trx) => {
          const trxDate = new Date(trx.Tanggal).getTime();
          return Date.now() - trxDate > SEVEN_DAYS;
        });

        if (!eligibleTransaction) {
          setLoading(false);
          return;
        }

        const userName = eligibleTransaction.Nama?.trim()?.toLowerCase();
        if (!userName) {
          setLoading(false);
          return;
        }

        // 3. Check if user already gave testimonial
        const testiRes = await fetch("/api/testimonial", { 
          signal: controller.signal,
          cache: "no-store" 
        });
        
        if (!testiRes.ok) throw new Error("Failed to fetch testimonials");
        const testimonials = await testiRes.json() as Testimonial[];

        const hasTestimonial = testimonials.some(
          (t) =>
            (t.nama || "").trim().toLowerCase() === userName &&
            ["true", "1", "yes", "ya"].includes(
              String(t.active).trim().toLowerCase()
            )
        );

        if (hasTestimonial) {
          setLoading(false);
          return;
        }

        // All checks passed - show popup
        setOpen(true);
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === "AbortError") return;
        
        console.error("RatingPopup - Error:", err);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    };

    checkPopupEligibility();

    return () => controller.abort();
  }, []);

  const closePopup = useCallback(() => {
    setOpen(false);
    localStorage.setItem(POPUP_KEY, new Date().toISOString());
  }, []);

  // Don't render anything while loading
  if (loading) return null;
  
  // Don't render if not open
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999998] flex items-center justify-center p-4"
      onClick={closePopup}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl p-6 relative max-w-md w-full animate-[fadeIn_0.3s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closePopup}
          className="absolute top-3 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Tutup popup"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="mb-5">
          <h3 className="text-xl font-semibold text-[#0B4B50] mb-2">
            Kasih Rating Minuman Kamu 🥤
          </h3>
          <p className="text-sm text-gray-500">
            Kamu sudah pernah order KOJE24. Ceritakan pengalaman kamu, yuk!
          </p>
        </div>

        {/* Form */}
        <TulisTestimoniForm onSuccess={closePopup} />
      </div>
    </div>
  );
}
