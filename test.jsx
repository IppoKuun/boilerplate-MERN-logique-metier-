"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import api from "@/lib/api"; // adapte le chemin si besoin

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // méta minimale pour paginer
  const [meta, setMeta] = useState({
    page: 1,
    limit: 30,
    total: 0,
  });

  // filtres
  const [sort, setSort] = useState("desc"); // "asc" | "desc"
  const [eventFilter, setEventFilter] = useState(""); // ex. "create" | "delete" | ...

  // calcul du total de pages
  const totalPages = useMemo(() => {
    const pages = Math.ceil((meta?.total || 0) / (meta?.limit || 30));
    return Math.max(1, pages);
  }, [meta.total, meta.limit]);

  // options d'événements (simples) extraites de la page courante
  const knownEvents = useMemo(() => {
    return Array.from(new Set((logs || []).map(l => l?.event).filter(Boolean))).sort();
  }, [logs]);

  const fetchLogs = useCallback(async (pageArg) => {
    setLoading(true);
    try {
      const page = pageArg ?? meta.page;
      const params = {
        page,
        limit: meta.limit,
        sortBy: "createdAt",
        order: sort,              // "asc" | "desc"
        ...(eventFilter ? { event: eventFilter } : {}),
      };

      const { data } = await api.get("/logs", { params });

      // tolérance format payload
      const items = data?.items ?? data?.data ?? data ?? [];
      const nextMeta = data?.meta ?? {
        page,
        limit: meta.limit,
        total: data?.total ?? (Array.isArray(items) ? items.length : 0),
      };

      setLogs(Array.isArray(items) ? items : []);
      setMeta(m => ({ ...m, ...nextMeta }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, sort, eventFilter]);

  // un seul effet : page/tri/filtre déclenchent un fetch
  useEffect(() => {
    fetchLogs();
  }, [meta.page, sort, eventFilter, fetchLogs]);

  // handlers pagination
  const nextPage = () => {
    if (meta.page < totalPages) setMeta(m => ({ ...m, page: m.page + 1 }));
  };
  const prevPage = () => {
    if (meta.page > 1) setMeta(m => ({ ...m, page: m.page - 1 }));
  };

  // reset filtres
  const resetFilters = () => {
    setEventFilter("");
    setSort("desc");
    setMeta(m => ({ ...m, page: 1 }));
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Logs</h1>
        <div className="flex items-center gap-2">
          {/* Filtre event */}
          <select
            value={eventFilter}
            onChange={(e) => { setEventFilter(e.target.value); setMeta(m => ({ ...m, page: 1 })); }}
            className="rounded-xl border px-3 py-2"
            aria-label="Filtrer par événement"
          >
            <option value="">Tous les événements</option>
            {knownEvents.map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>

          {/* Tri */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setMeta(m => ({ ...m, page: 1 })); }}
            className="rounded-xl border px-3 py-2"
            aria-label="Trier par date"
          >
            <option value="desc">Décroissant (récent → ancien)</option>
            <option value="asc">Croissant (ancien → récent)</option>
          </select>

          <button
            onClick={resetFilters}
            className="rounded-xl border px-3 py-2 hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </header>

      {/* Tableau */}
      <div className="overflow-hidden rounded-2xl border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm text-gray-600">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Événement</th>
              <th className="px-4 py-3">Acteur</th>
              <th className="px-4 py-3">Cible</th>
              <th className="px-4 py-3">Détails</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>Chargement…</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-gray-500" colSpan={5}>Aucun log à afficher.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id || log.id}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded px-2 py-0.5 text-sm font-medium
                      bg-gray-100 text-gray-800">
                      {log.event || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{log.user?.email || log.user?.name || "—"}</td>
                  <td className="px-4 py-3">{log.target || log.resource || log.entity || "—"}</td>
                  <td className="px-4 py-3">{log.message || log.details || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {meta.page} / {Math.max(1, totalPages)} — {meta.total} log(s)
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={meta.page <= 1}
            className="rounded-xl border px-3 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            ← Précédent
          </button>
          <button
            onClick={nextPage}
            disabled={meta.page >= totalPages}
            className="rounded-xl border px-3 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
