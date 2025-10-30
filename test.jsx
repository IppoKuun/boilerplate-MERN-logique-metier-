"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

/** Helpers très légers (pas de multipath, pas de magie) */
const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [health, setHealth] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    let alive = true;

    async function fetchAll() {
      try {
        setLoading(true);

        // 1) Santé (ton endpoint existant)
        const healthRes = await api.get("/health");
        const h = healthRes.data;
        const status = h.ok ? "ok" : "down";
        const dbStatus = h.db || "unknown";
        const env = h.env || "unknown";

        // 2) Nombre de produits (essayez /products/count, sinon fallback simple)
          let count = null;
          try {
            const c = await api.get("/products/count");
            count = c.data?.count ?? null;
          } catch {
            count = null;
          }


        // 3) 5 derniers produits (on suppose triable par createdAt desc)
        const prodsRes = await api.get("/products", {
          params: { limit: 5, sort: "-createdAt" },
        });
        const prods = pickArray(prodsRes.data).map((p) => ({
          id: p._id || p.id,
          title: p.title || p.name || "Sans titre",
          price: p.price ?? null,
          image:
            p.image ||
            p.thumbnail ||
            p.images?.[0] ||
            null,
          createdAt: p.createdAt || p.updatedAt || null,
          category: p.category?.name || p.category || null,
        }));

        // 4) 5 derniers logs (si tu as /logs)
        let logs = [];
        try {
          const logsRes = await api.get("/logs", {
            params: { limit: 5, sort: "-createdAt" },
          });
          logs = pickArray(logsRes.data).map((l, i) => ({
            id: l._id || l.id || `log-${i}`,
            level: l.level || "info",
            message: l.message || JSON.stringify(l),
            createdAt: l.createdAt || l.ts || null,
          }));
        } catch {
          // pas de logs → on laisse vide
        }

        if (!alive) return;

        setHealth({ status, dbStatus, env });
        setProductCount(count);
        setRecentProducts(prods);
        setRecentLogs(logs);
        setErr(null);
      } catch (e) {
        if (!alive) return;
        setErr(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchAll();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin • Dashboard</h1>

      {err && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">
          {err}
        </div>
      )}

      {/* Cartes principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Produits</div>
          <div className="text-3xl font-bold mt-1">
            {loading ? "…" : productCount ?? "—"}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Santé</div>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={
                "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium " +
                (health?.status === "ok"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800")
              }
            >
              {loading ? "…" : health?.status ?? "unknown"}
            </span>
            <span className="text-xs text-gray-500">
              DB: {loading ? "…" : health?.dbStatus ?? "?"}
            </span>
            <span className="text-xs text-gray-500">
              Env: {loading ? "…" : health?.env ?? "?"}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Dernier log</div>
          <div className="mt-1 text-sm line-clamp-2">
            {loading ? "…" : recentLogs[0]?.message ?? "—"}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-gray-500">Dernier produit</div>
          <div className="mt-1 text-sm line-clamp-2">
            {loading ? "…" : recentProducts[0]?.title ?? "—"}
          </div>
        </div>
      </div>

      {/* Listes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-medium mb-3">5 derniers produits</h2>
          <ul className="space-y-3">
            {(loading ? Array.from({ length: 5 }) : recentProducts).map(
              (p, i) => (
                <li key={p?.id || i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                    {loading ? "…" : p?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">
                      {loading ? "…" : p?.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loading
                        ? "…"
                        : p?.price != null
                        ? new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                          }).format(p.price)
                        : "—"}
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-medium mb-3">5 derniers logs</h2>
          <ul className="space-y-3">
            {(loading ? Array.from({ length: 5 }) : recentLogs).map((l, i) => (
              <li key={l?.id || i} className="flex items-start gap-3">
                <span className="mt-1 text-xs px-2 py-0.5 rounded bg-gray-100">
                  {loading ? "…" : l?.level ?? "info"}
                </span>
                <div className="text-sm">{loading ? "…" : l?.message}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
