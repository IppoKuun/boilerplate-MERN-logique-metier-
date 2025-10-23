"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiMenu3Line, RiUser3Line } from "remixicon-react"; // ← import des icônes

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  const navLinkClass = (href) =>
    `px-3 py-2 rounded-md text-sm font-medium transition
     ${pathname === href ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-40 bg-gray-800/95 backdrop-blur border-b border-gray-700">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo + Nom */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-500" />
            <span className="text-white font-semibold">MiniShop</span>
          </Link>

          {/* Liens desktop */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/" className={navLinkClass("/")}>Accueil</Link>
            <Link href="/products" className={navLinkClass("/products")}>Produits</Link>

            {/* Bouton Admin avec icône */}
            <Link
              href="/login"
              className="ml-2 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
            >
              <RiUser3Line size={18} />
              Admin
            </Link>
          </div>

          {/* Bouton burger mobile */}
          <button
            type="button"
            aria-label="Ouvrir le menu"
            onClick={() => setOpen(!open)}
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-300 hover:bg-gray-700 hover:text-white transition"
          >
            <RiMenu3Line size={22} />
          </button>
        </div>

        {/* Menu mobile */}
        {open && (
          <div className="md:hidden pb-3">
            <div className="space-y-1 pt-2">
              <Link href="/" className={navLinkClass("/")}>Accueil</Link>
              <Link href="/products" className={navLinkClass("/products")}>Produits</Link>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-500 transition"
              >
                <RiUser3Line className="inline mr-1" size={18} />
                Admin
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
