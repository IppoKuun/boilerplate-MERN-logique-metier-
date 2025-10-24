// src/app/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

// Utilitaire d'extraction des catégories depuis ce qu'on a déjà (simple, local)
const getCategories = (products) => {
  const s = new Set(products.map(p => p.category).filter(Boolean));
  return ["toutes", ...Array.from(s)];
};

// Map “tri” UI → paramètres API (selon ton queryBuilder backend)
const mapSort = (s) => {
  switch (s) {
    case "prix-asc":  return { sortBy: "price", order: "asc" };
    case "prix-desc": return { sortBy: "price", order: "desc" };
    case "recent": return { sortBy: "createdAt", order: "desc" };
    default:          return {};
  }
};

export default function PublicPage() {
  // États UI (visuels)
  const [category, setCategory] = useState("toutes");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("pertinence"); // = laisser l’ordre backend (récent d’abord)

  // Données & statut
  const [products, setProducts] = useState([]);  
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  // Construit les query params pour l’API (n’envoie pas les vides)
  const params = useMemo(() => {
    const p = {};
    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p["price[min]"] = Number(minPrice);
    if (maxPrice !== "") p["price[max]"] = Number(maxPrice);

    const m = mapSort(sortBy);
    if (m.sortBy) p.sortBy = m.sortBy;
    if (m.order)  p.order  = m.order;

    return p;
  }, [category, minPrice, maxPrice, sortBy]);

  // Appel API (debouncé) dès que les filtres changent
  useEffect(() => {
    let alive = true;
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await api.get("/products", { params, signal: controller.signal });

        const items =
          Array.isArray(res?.data) ? res.data :
          Array.isArray(res?.data?.data) ? res.data.data :
          Array.isArray(res?.data?.items) ? res.data.items :
          [];

        const normalized = items.map(p => ({
          id: p.id || p._id,
          name: p.name || p.nom || p.title || "Sans nom",
          price: Number(p.price ?? 0),
          category: p.category || p.type || "autre",
          image: (p.images && p.images[0]) || p.image || p.imageUrl || "/placeholder.png",
          createdAt: p.createdAt || p.created_at || null,
        }));

        if (alive) setProducts(normalized);
      } catch (e) {
        if (alive) setError(ece?.message || "Erreur de chargement");
      } finally {
        if (alive) setLoading(false);
      }
    }, 250); // petit debounce

    return () => { alive = false; controller.abort(); clearTimeout(t); };
  }, [params]);

  const categories = useMemo(() => getCategories(products), [products]);

  // ————————————————————— Rendu
  if (loading) return <main className="min-h-screen p-8">Chargement…</main>;
  if (error)   return <main className="min-h-screen p-8 text-red-600">Erreur : {error}</main>;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Lien admin en haut-droite */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-end">
          <Link href="/login" className="text-sm font-medium text-indigo-700 hover:text-indigo-900 underline underline-offset-2">
            → Cliquez ici pour visualiser le backoffice admin
          </Link>
        </div>
      </div>

      {/* Contenu principal */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres (poussent des query params au backend) */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Catégorie</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Prix min (€)</span>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Prix max (€)</span>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm text-gray-600">Trier par</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="pertinence">Pertinence (ordre backend)</option>
              <option value="prix-asc">Prix : croissant</option>
              <option value="prix-desc">Prix : décroissant</option>
              <option value="nom-asc" disabled>Nom : A → Z (géré côté backend si besoin)</option>
            </select>
          </label>
        </div>

        {/* Compteur + reset visuel (reset côté front = vider les params) */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {products.length} produit{products.length > 1 ? "s" : ""} affiché{products.length > 1 ? "s" : ""}
          </p>
          <button
            onClick={() => { setCategory("toutes"); setMinPrice(""); setMaxPrice(""); setSortBy("pertinence"); }}
            className="text-sm rounded-md border border-gray-300 bg-white px-3 py-2 hover:bg-gray-100"
          >
            Réinitialiser les filtres
          </button>
        </div>

        {/* Grille de cartes (affiche directement la réponse backend) */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <article key={p.id} className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="aspect-[4/3] bg-gray-100">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-gray-900">{p.name}</h3>
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-700">{p.category}</span>
                </div>
                <p className="mt-2 text-lg font-semibold text-gray-900">{p.price.toFixed(2)} €</p>
                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/products/${p.id}`} className="text-sm font-medium text-indigo-700 hover:text-indigo-900">
                    Voir le détail →
                  </Link>
                  <button
                    type="button"
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm hover:bg-gray-100"
                    onClick={() => alert(`Aperçu rapide : ${p.name}`)}
                  >
                    Aperçu
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {products.length === 0 && (
          <div className="mt-16 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600">
            Aucun produit ne correspond à vos filtres.
          </div>
        )}
      </section>
    </main>
  );
}
