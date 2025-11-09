"use client"
import api from "@/app/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"



export default function LogsPage(){
    const [logs, setLogs] = useState([])
    const [meta, setMeta]= useState({ page:1, limit:30, total:0})
    const [sort, setSort] = useState("desc")
    const [eventFilter, setEventFilter] = useState("toutes")
    const [loading, setLoading] = useState(false)
      // calcul du total de pages

      const ttPages = useMemo(()=> {
        const pages = Math.ceil(meta.total / meta.limit)
        return  Math.max(1, pages);
      }, [meta.limit, meta.total])

    //EXTRAIRE EVENNEMENT EN ARRAY 

        const knowEvents = useMemo(()=> {
            const arr = logs.map((l)=> l.event).filter(Boolean)
            return Array.from(new Set(arr)).sort();
        }, [logs])


        const fetchLogs = useCallback(async () => {
        try{
            setLoading(true)
            const params =({
                page: meta.page,
                limit:meta.limit ?? 30,
                sortBy:"ts",
                order:sort,
                ...(eventFilter && eventFilter !== "toutes" ? { events: eventFilter }: {})
            })

        const {data} = await api.get("/audits", { params})
        setLogs(data.data || data.items || [])
        setMeta(data.meta)
        } catch(e){
            console.log(e.message)
        }finally{
            setLoading(false)
        }
        }, [meta.page, meta.limit, sort, eventFilter])

            useEffect(()=> {
            fetchLogs()
            }, [fetchLogs])

            const nextPage = () => {
                if (meta.page < ttPages) setMeta(m => ({ ...m, page: m.page + 1 }));
            };
            const prevPage = () => {
                if (meta.page > 1) setMeta(m => ({ ...m, page: m.page - 1 }));
            };

            const resetFilters = () => {
                setEventFilter("toutes");
                setSort("desc");
                setMeta(m => ({ ...m, page: 1 }));
            };

    return(
        <main className="">
            <div className="">
                <label className="">Trier par:</label>
                <select value={eventFilter} className="" onChange={(e) => setEventFilter(e.target.value)}>
                    <option className="" value={toutes}>Toutes</option>
                    {knowEvents.map((l)=> (
                        <option value={l} className="" key={l.id||_id}>{l}</option>
                    ))}
                </select>
                <select value={sort} onChange={(e)=> setSort(e.target.value)}>
                    <option value="asc">Croissant</option>
                    <option value="desc">Décroissant</option>
                </select>
                <button className="" onClick={resetFilters}>Réinitialisez les filtres</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Date</th>
                        <th>Event</th>
                        <th>Acteur</th>
                    </tr>
                </thead>
                <tbody>

                    {loading && (
                        <tr><td colSpan={4}>Chargemet des logs</td></tr>
                    )}
                    {logs.length === 0 && (
                        <tr><td colSpan={4}>Aucun logs pour l'instant</td></tr>
                    )}

                    {logs.map((p)=> (
                        <tr className="" key={p.id||p._id}>
                            <td className="">
                                {p.target}
                            </td>
                            <td className="">
                                {p.ts}
                            </td>
                            <td className="">
                                {p.event}
                            </td>
                            <td className="">
                                {p.actor.user}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                    Page {meta.page} / {Math.max(1, ttPages)} — {meta.total} log(s)
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
                        disabled={meta.page >= ttPages}
                        className="rounded-xl border px-3 py-2 disabled:opacity-50 hover:bg-gray-50"
                    >
                        Suivant →
                    </button>
                </div>
            </div>
        </main>
    )

}