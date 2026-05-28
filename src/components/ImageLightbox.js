"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function ImageLightbox({
  images = [],
  activeIndex = 0,
  onClose,
  onChangeIndex,
  title = "",
}) {
  const go = useCallback(
    (dir) => {
      if (!images.length) return;
      const next = (activeIndex + dir + images.length) % images.length;
      onChangeIndex?.(next);
    },
    [activeIndex, images.length, onChangeIndex]
  );

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [go, onClose]);

  if (!images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xl"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image zoom"
    >
      <div
        className="relative flex w-full max-w-4xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-2 right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-800/80 text-white hover:bg-red-500 md:right-2"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-black/40 shadow-2xl">
          <Image
            src={images[activeIndex]}
            alt={title || "Product"}
            fill
            className="object-contain"
            unoptimized
            priority
          />
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
          >
            <ChevronRight size={22} />
          </button>
          <span className="absolute bottom-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-bold text-white">
            {activeIndex + 1} / {images.length}
          </span>
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex max-w-full gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChangeIndex?.(i)}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === activeIndex ? "border-cyan-500 opacity-100" : "border-transparent opacity-50"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
