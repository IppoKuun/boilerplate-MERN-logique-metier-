// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] grid place-items-center px-6 py-16">
      <div className="text-center max-w-xl">
        <p className="text-sm font-medium text-gray-500">Erreur 404</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-4 text-gray-600">
          Désolé, la page que vous cherchez n’existe pas ou a été déplacée.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Revenir à l’accueil
          </Link>

          <Link
            href="/products"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Voir les produits
          </Link>
        </div>

        {/* Petit visuel SVG, aucune dépendance */}
        <div className="mt-10 flex justify-center opacity-80">
          <svg width="180" height="100" viewBox="0 0 180 100" aria-hidden="true">
            <rect x="5" y="10" width="170" height="80" rx="10" fill="#f3f4f6" />
            <circle cx="40" cy="50" r="18" fill="#e5e7eb" />
            <rect x="70" y="35" width="90" height="10" rx="4" fill="#e5e7eb" />
            <rect x="70" y="55" width="70" height="10" rx="4" fill="#e5e7eb" />
          </svg>
        </div>

        <p className="sr-only">Illustration 404</p>
      </div>
    </main>
  );
}
