"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal, RotateCcw, ChevronLeft, ChevronRight, LogIn } from "lucide-react";
import api from "./lib/api";
import logo from "../../public/logo.png";



const getCategories = (products) => {
  const cat = products.map((p) => p.category);
  const s = new Set(cat);
  return ["toutes", ...Array.from(s)];
};

export default function Home() {
  const [products, setAllproducts] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(100);
  const [category, setCategory] = useState("toutes");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sort, setSort] = useState("default");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [meta, setMeta] = useState(null);

  const currency = useMemo(
    () => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }),
    []
  );

  const params = useMemo(() => {
    const p= {}
    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p.minPrice = Number(minPrice);
    if (maxPrice !== "") p.maxPrice = Number(maxPrice);
    if (sort === "asc" || sort === "desc") {
      p.sortBy = "price";
      p.order = sort;
    }
    p.page = page;
    p.limit = limit;
    return p;
  }, [category, minPrice, maxPrice, page, limit, sort]);

  useEffect(() => { setPage(1); }, [category, minPrice, maxPrice]);

  useEffect(() => {
    const controllers = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await api.get("/products", { params, signal: controllers.signal });
        const metaFromApi = res?.meta || res?.pagination || null;
        setMeta(metaFromApi);
        const safeItems = (res?.items ?? []).map((i) => ({
          id: i.id || i._id,
          shortDesc: i.shortDesc,
          slug: i.slug,
          images: i.images?.[0]?.url ?? null,
          category: i.category,
          price: i.price,
          name: i.name,
        }));
        setAllproducts(safeItems);
        console.log("CLOUD NAME =>", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

      } catch (e) {
        console.error("GET /products failed:", e);
        const msg = e?.msg || e?.message || e?.data?.error || "Network error";
        setErr(msg);
      } finally { setLoading(false); }
    }, 250);
    return () => { controllers.abort(); clearTimeout(t); };
  }, [params]);

  const categories = useMemo(() => getCategories(products), [products]);

  

  const resetFilter = () => {
    setMinPrice(0);
    setMaxPrice(100);
    setCategory("toutes");
    setSort("default");
  };

  if (loading) {
    return (
      <main className="min-h-screen grid place-items-center bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-200">
        <div className="flex items-center gap-3 text-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-600" />
          Chargement…
        </div>
      </main>
    );
  }
  if (err) {
    return (
      <main className="min-h-screen grid place-items-center bg-white text-red-600 dark:bg-slate-950 dark:text-red-400">
        Erreur : {err}
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900">
      {/* Top bar */}
      <header className="container mx-auto flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Image src={logo} alt="NodeShop" className="h-10 w-auto" priority />
          <span className="sr-only">NodeShop</span>
        </div>
        <Link
          href={"/login"}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
        >
          <LogIn className="h-4 w-4" />
          Se connecter
        </Link>
      </header>

      <main>
        {/* Hero */}
        <section className="container mx-auto grid grid-cols-1 items-center gap-6 px-4 pb-10 pt-4 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Bienvenue sur <span className="text-brand-600">NodeShop</span>
            </h1>
            <h2 className="mt-2 text-lg text-slate-600 dark:text-slate-300">Le shop moderne, simple et rapide</h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              NodeShop réunit le meilleur du minimalisme et du confort.
            </p>
            <button
              onClick={() => document.getElementById("products")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800"
            >
              Découvrir nos produits
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="order-1 flex justify-center md:order-2">
            <div className="relative rounded-2xl border border-brand-100 bg-white p-5 shadow-sm dark:border-brand-900/40 dark:bg-slate-900">
              <Image src={logo} alt="NodeShop" className="h-28 w-auto" />
            </div>
          </div>
        </section>

        {/* Filtres */}
        <section className="container mx-auto px-4">
          <div className="card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Catégorie</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Prix min</span>
                <input
                  type="number"
                  placeholder="Entrez un nombre"
                  min={0}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="input"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Prix max</span>
                <input
                  type="number"
                  placeholder="Entrez un nombre"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="input"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Trier par</span>
                <select
                  className="input"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="default">Défaut</option>
                  <option value="asc">Prix ↑</option>
                  <option value="desc">Prix ↓</option>
                </select>
              </label>

              <div className="flex items-end">
                <button onClick={resetFilter} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">
                  <RotateCcw className="h-4 w-4" />
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Produits */}
        <section id="products" className="container mx-auto px-4 py-8">
          <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Nos produits</h3>

          {products.length === 0 ? (
            <p className="card p-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Aucun produit disponible.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group card p-3 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <article>
                    <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={typeof p.images === "string" ? p.images : p.images?.url ?? "/placeholder.png"}
                        alt={p.name}
                        width={500}
                        height={500}
                        className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-900 dark:text-white">
                          {currency.format(Number(p.price ?? 0))}
                        </span>
                        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700 ring-1 ring-brand-100 dark:bg-brand-900/30 dark:text-brand-300 dark:ring-brand-900">
                          {p.category}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</div>
                      {p.shortDesc && <div className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{p.shortDesc}</div>}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        <div className="container mx-auto flex items-center justify-between px-4 pb-12">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          <div className="text-sm text-slate-600 dark:text-slate-300">
            Page {meta?.page ?? page} / {meta?.totalPages ?? "?"}
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-50 active:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            onClick={() => setPage((p) => p + 1)}
            disabled={meta?.totalPages ? page >= meta.totalPages : false}
          >
            Suivant
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </main>
    </div>
  );
}
