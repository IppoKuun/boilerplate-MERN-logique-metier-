"use client"
import api from "@/app/lib/api"
import { useEffect, useState } from "react"
import Image from "next/image"


export default function DashboardPage(){
  const [recentProducts, setRecentProducts] = useState([])
  const [recentAudits, setRecentsAudits] = useState([])
  const [health, setHealth] = useState("")
  const [ttProd, setTtprod] = useState(0)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        setLoading(true)
        // Axios renvoie déjà res.data via l'interceptor → pas de {data:…}
        const [h, p, a] = await Promise.all([
          api.get("/health", { signal: controller.signal }),
          api.get("/products", {
            params: { limit: 5, sortBy: "createdAt", order: "desc" },
            signal: controller.signal
          }),
          api.get("/audits", {
            params: { limit: 5, sortBy: "createdAt", order: "desc" },
            signal: controller.signal
          }),
        ])

        setHealth(h?.ok ? "up" : "down")
        setRecentProducts(p?.items ?? [])
        setRecentsAudits(a?.items ?? [])
        setTtprod(p?.meta?.total ?? p?.items?.length ?? 0)
      } catch (e) {
        if (e?.name !== "CanceledError") setErr(e?.msg || e?.data?.error || e?.message || "Erreur inconnue")
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="w-56 h-1 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div className="h-full w-1/2 bg-brand-600 animate-progress" />
        </div>
      </div>
    )
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      {err && (
        <div className="card border-red-200/60 dark:border-red-900/50 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-3">
          {err}
        </div>
      )}

      <h1 className="text-2xl font-semibold text-brand-600">Admin - Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="card p-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Santé du serveur</span>
          <span
            className={`mt-1 inline-block px-2 py-0.5 rounded-xl text-sm font-medium ${
              health === "up"
                ? "bg-brand-100 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
            }`}
          >
            {health || "—"}
          </span>
        </section>

        <section className="card p-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">Produits dans la boutique</span>
          <span className="text-lg font-semibold">{ttProd ?? 0}</span>
        </section>
      </div>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-4">
          <span className="block mb-3 font-medium">5 Derniers produits</span>
          <ul className="space-y-3">
            {recentProducts.map((p) => (
              <li key={p._id} className="flex items-center gap-3">
                <div className="shrink-0 rounded-xl overflow-hidden border border-slate-200/70 dark:border-slate-800/70">
                
                    <Image
                      src={p?.images?.[0]?.url}
                      alt={p.name || p.slug || "Produit"}
                      width={56}
                      height={56}
                    />
                </div>
                <div className="min-w-0">
                  <span className="block text-sm font-medium line-clamp-2">{p.slug}</span>
                  <div className="text-xs text-gray-500">
                    {p.price != null
                      ? new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(p.price)
                      : "—"}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-4">
          <p className="mb-3 font-medium">5 Derniers audits</p>
          <ul className="space-y-2">
            {recentAudits.map((a) => (
              <li key={a._id || a.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="px-2 py-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                  {a?.event}
                </span>
                <span className="text-slate-700 dark:text-slate-300">{a.events}</span>
                <span className="text-slate-500">{a.ts}</span>
                <span className="text-slate-500">{a.user}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
