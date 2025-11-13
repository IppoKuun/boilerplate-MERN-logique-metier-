"use client"
import api from "@/app/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"

export default function LogsPage() {
  const [logs, setLogs] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 30, total: 0 })
  const [sort, setSort] = useState("desc")
  const [eventFilter, setEventFilter] = useState("toutes")
  const [loading, setLoading] = useState(false)

    const formatDate = (value) => {
    if (!value) return "—";
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const ttPages = useMemo(() => {
    const pages = Math.ceil((meta.total || 0) / (meta.limit || 30))
    return Math.max(1, pages)
  }, [meta.limit, meta.total])

  // extraire événements
  const knowEvents = useMemo(() => {
    const arr = logs.map((l) => l.event).filter(Boolean)
    return Array.from(new Set(arr)).sort()
  }, [logs])

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: meta.page,
        limit: meta.limit ?? 30,
        sortBy: "ts",
        order: sort,
        ...(eventFilter && eventFilter !== "toutes" ? { event: eventFilter } : {}),
      }

      // api.get renvoie déjà les données (pas { data })
      const res = await api.get("/audits", { params })
      const list = res?.items ?? res?.data ?? res ?? []
      setLogs(Array.isArray(list) ? list : [])
      setMeta((m) => ({
        ...m,
        ...(res?.meta || {}),
        total: res?.meta?.total ?? (Array.isArray(list) ? list.length : m.total),
      }))
    } catch (e) {
      console.error(e?.msg || e?.message || "Erreur de chargement des logs")
    } finally {
      setLoading(false)
    }
  }, [meta.page, meta.limit, sort, eventFilter])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const nextPage = () => {
    if (meta.page < ttPages) setMeta((m) => ({ ...m, page: m.page + 1 }))
  }
  const prevPage = () => {
    if (meta.page > 1) setMeta((m) => ({ ...m, page: m.page - 1 }))
  }

  const resetFilters = () => {
    setEventFilter("toutes")
    setSort("desc")
    setMeta((m) => ({ ...m, page: 1 }))
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      <h1 className="text-2xl font-semibold text-brand-600">Logs</h1>

      {/* filtres */}
      <div className="card p-4 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-sm text-slate-600">Filtrer par événement :</label>
          <select
            value={eventFilter}
            className="input w-56"
            onChange={(e) => setEventFilter(e.target.value)}
          >
            <option value="toutes">Toutes</option>
            {knowEvents.map((l) => (
              <option value={l} key={l}>
                {l}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-slate-600">Ordre :</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input w-40"
          >
            <option value="asc">Croissant</option>
            <option value="desc">Décroissant</option>
          </select>
        </div>

        <button className="btn" onClick={resetFilters}>
          Réinitialiser les filtres
        </button>
      </div>

      {/* tableau */}
      <div className="card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/40">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Produit</th>
              <th className="px-4 py-2 text-left font-medium">Date</th>
              <th className="px-4 py-2 text-left font-medium">Event</th>
              <th className="px-4 py-2 text-left font-medium">Acteur</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-slate-500">
                  Chargement des logs…
                </td>
              </tr>
            )}

            {!loading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-slate-500">
                  Aucun log pour l&apos;instant
                </td>
              </tr>
            )}

            {!loading &&
              logs.map((p) => (
                <tr
                  className="border-t border-slate-200/60 dark:border-slate-800/60"
                  key={p.id || p._id}
                >
                  <td className="px-4 py-2">{p.target?.slug ?? p.target?.type?.slug ?? "-"}</td>
                  <td className="px-4 py-2">{formatDate(p.ts)}</td>
                  <td className="px-4 py-2">{p.event}</td>
                  <td className="px-4 py-2">{p.actor?.user || "—"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="flex items-center justify-between card p-3">
        <div className="text-sm text-slate-600">
          Page {meta.page} / {Math.max(1, ttPages)} — {meta.total} log(s)
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={meta.page <= 1}
            className="btn disabled:opacity-50"
          >
            ← Précédent
          </button>
          <button
            onClick={nextPage}
            disabled={meta.page >= ttPages}
            className="btn-primary disabled:opacity-50"
          >
            Suivant →
          </button>
        </div>
      </div>
    </main>
  )
}
