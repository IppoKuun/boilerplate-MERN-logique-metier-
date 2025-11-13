"use client";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import logo from "@/app/logo.png"; // ou "/logo.png" si tu l'as en /public



export default function PageLoaderLogo({
  loading = true,
  label = "Chargement…",
  delayMs = 180,
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!loading) return setShow(false);
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [loading, delayMs]);

  if (!loading || !show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[9999] grid place-items-center bg-white/85 dark:bg-black/70 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative">
          <span className="pointer-events-none absolute inset-0 rounded-2xl animate-glow" />
          <Image
            src={logo}
            alt="NodeShop"
            width={180}
            height={180}
            priority
            className="select-none"
          />
          <Loader2 aria-hidden className="absolute -right-2 -bottom-2 h-5 w-5 animate-spin text-brand-600/80" />
        </div>

        <div className="w-56 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-brand-600 animate-progress" />
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
      </div>
    </div>
  );
}
