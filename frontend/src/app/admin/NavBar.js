"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const navLinkClass = (href) => {
    const isActive = pathname === href;
    return [
      "px-3 py-1 rounded-xl text-sm font-medium transition",
      isActive
        ? "bg-brand-600 text-white"
        : "text-slate-500 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70",
    ].join(" ");
  };

  return (
    <header className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo + titre */}
        <Link
          href="/admin/adminAcceuil"
          className="flex items-center gap-2"
          aria-label="Accueil admin NodeShop"
        >
          <Image
            src="/logo.png"
            alt="Logo app"
            width={40}
            height={40}
            className="rounded-xl border border-slate-200/60 dark:border-slate-800/60"
          />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              NodeShop
            </span>
            <span className="text-xs text-brand-600">Panel admin</span>
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/admin/adminAcceuil"
            className={navLinkClass("/admin/adminAcceuil")}
          >
            Accueil
          </Link>
          <Link
            href="/admin/products"
            className={navLinkClass("/admin/products")}
          >
            Produits
          </Link>
          <Link href="/admin/logs" className={navLinkClass("/admin/logs")}>
            Logs
          </Link>
        </div>

        {/* Bouton mobile */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label="Ouvrir le menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/70 bg-white text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 md:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="flex flex-col gap-1.5">
            <span className="block h-[2px] w-4 rounded bg-current" />
            <span className="block h-[2px] w-4 rounded bg-current" />
            <span className="block h-[2px] w-4 rounded bg-current" />
          </span>
        </button>
      </nav>

      {/* Menu mobile */}
      {open && (
        <div className="border-t border-slate-200/60 bg-white dark:border-slate-800/60 dark:bg-slate-950 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            <Link
              href="/admin/adminAcceuil"
              className={navLinkClass("/admin/adminAcceuil")}
              onClick={() => setOpen(false)}
            >
              Accueil
            </Link>
            <Link
              href="/admin/products"
              className={navLinkClass("/admin/products")}
              onClick={() => setOpen(false)}
            >
              Produits
            </Link>
            <Link
              href="/admin/logs"
              className={navLinkClass("/admin/logs")}
              onClick={() => setOpen(false)}
            >
              Logs
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
