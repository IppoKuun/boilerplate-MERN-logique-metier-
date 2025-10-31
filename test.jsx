"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import PageLoaderLogo from "@/components/PageLoader";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [health, setHealth] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        const [{ data: h }, { data: p }, { data: prods }, { data: logs }] =
          await Promise.all([
            api.get("/health", { signal: controller.signal }),
            api.get("/products", { params: { limit: 1, page: 1 }, signal: controller.signal }),
            api.get("/products", { params: { limit: 5, sort: "-createdAt" }, signal: controller.signal }),
            api.get("/logs", { params: { limit: 5, sort: "-createdAt" }, signal: controller.signal }).catch(() => ({ data: { items: [] } })),
          ]);

        setHealth(h.ok ? "up" : "down");
        setProductCount(p?.meta?.total ?? null);
        setRecentProducts(prods?.items ?? []);
        setRecentLogs(logs?.items ?? []);
        setErr(null);
      } catch (e) {
        if (e.name !== "CanceledError") setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  if (loading) return <PageLoaderLogo loading label="Initialisation du dashboard…" />;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin • Dashboard</h1>

      {err && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{err}</div>
      )}

      {/* cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Produits</div>
          <div className="text-3xl font-bold mt-1">{productCount ?? "—"}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Santé</div>
          <span className={`mt-1 inline-block px-2 py-0.5 rounded text-sm font-medium
            ${health === "up" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {health}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Dernier log</div>
          <div className="mt-1 text-sm line-clamp-2">{recentLogs[0]?.message ?? "—"}</div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Dernier produit</div>
          <div className="mt-1 text-sm line-clamp-2">{recentProducts[0]?.title ?? "—"}</div>
        </div>
      </div>

      {/* listes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-medium mb-3">5 derniers produits</h2>
          <ul className="space-y-3">
            {recentProducts.map((p) => (
              <li key={p._id || p.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                  {p.image
                    ? <img src={p.image} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xs text-gray-400">N/A</span>}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.title}</div>
                  <div className="text-xs text-gray-500">
                    {p.price != null
                      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.price)
                      : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-medium mb-3">5 derniers logs</h2>
          <ul className="space-y-3">
            {recentLogs.map((l) => (
              <li key={l._id || l.id} className="flex items-start gap-3">
                <span className="mt-1 text-xs px-2 py-0.5 rounded bg-gray-100">{l.level ?? "info"}</span>
                <div className="text-sm">{l.message}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
