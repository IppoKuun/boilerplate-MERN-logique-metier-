"use client";
import Image from "next/image";

export default function PageLoaderLogo({ loading = true, label = "Chargement…" }) {
  if (!loading) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 grid place-items-center bg-white/85 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Logo avec léger glow vert */}
        <div className="animate-glow">
          <Image
            src="/logo.png"
            alt="NodeShop"
            width={180}
            height={180}
            priority
            className="select-none"
          />
        </div>

        {/* Barre de progression animée */}
        <div className="w-56 h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full w-1/2 bg-green-500 rounded-full animate-progress" />
        </div>

        {/* Label accessible */}
        <p className="text-sm text-gray-600">{label}</p>
      </div>
    </div>
  );
}
