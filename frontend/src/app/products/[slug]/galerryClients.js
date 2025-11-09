"use client";
import { useEffect, useState, useCallback } from "react";


export default function GalleryClient({ images = [], alt = "Produit" }) {
  const valid = images.filter(Boolean);
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0); // index courant

  const prev = useCallback(() => setI(v => (v - 1 + valid.length) % valid.length), [valid.length]);
  const next = useCallback(() => setI(v => (v + 1) % valid.length), [valid.length]);

  // navigation clavier quand la lightbox est ouverte
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, prev, next]);

  if (!valid.length) {
    return (
      <div className="aspect-[4/3] w-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
        Pas d’image
      </div>
    );
  }

  return (
    <>
      {/* Image principale cliquable */}
      <button
        type="button"
        className="w-full border rounded-xl overflow-hidden group"
        onClick={() => { setI(0); setOpen(true); }}
        aria-label="Ouvrir la galerie"
      >
        <img
          src={valid[0]}
          alt={alt}
          className="w-full h-auto object-cover group-hover:opacity-95"
        />
        {/* Si tu préfères next/image :
        <Image src={valid[0]} alt={alt} width={1200} height={900} className="w-full h-auto object-cover" />
        */}
      </button>

      {/* Thumbnails */}
      {valid.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {valid.slice(0, 8).map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => { setI(idx); setOpen(true); }}
              className={`border rounded-md overflow-hidden ${idx === i ? "ring-2 ring-black" : ""}`}
              aria-label={`Ouvrir image ${idx + 1}`}
            >
              <img src={src} alt={`${alt} ${idx + 1}`} className="w-full h-20 object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox (modal plein écran) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            {/* Image courante */}
            <img src={valid[i]} alt={`${alt} agrandie`} className="w-full h-auto rounded-lg object-contain" />
            {/* Boutons navigation */}
            {valid.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm"
                >
                  ◀
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm"
                >
                  ▶
                </button>
              </>
            )}
            {/* Fermer */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 -right-3 rounded-full bg-white px-3 py-1 text-sm shadow"
              aria-label="Fermer"
            >
              ✕
            </button>

            {/* Miniatures dans la lightbox (optionnel) */}
            {valid.length > 1 && (
              <div className="mt-3 grid grid-cols-6 gap-2">
                {valid.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setI(idx)}
                    className={`border rounded-md overflow-hidden ${idx === i ? "ring-2 ring-white" : ""}`}
                    aria-label={`Voir image ${idx + 1}`}
                  >
                    <img src={src} alt={`${alt} ${idx + 1}`} className="w-full h-16 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
