"use client"
import api from "@/app/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"



export default async function LogsPage(){
    const [logs, setLogs] = useState({})
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
            const event = logs.map((l)=> l.event)
            const s = new Set ([Array.from(event).sort()])
            return s
        }, [logs])


        const fetchLogs = useCallback(async (pageAc)=> {
        try{
            setLoading(true)
            const params =({
                page: meta.page,
                limit:30,
                sortBy:"ts",
                order:sort,
                events: eventFilter
            })

        const {data} = api.get("/audits", { params})
        setLogs(data.data || data.items || {})
        setMeta(data.meta)
        } catch(e){
            console.log(e.msg)
        }finally{
            setLoading(true)
        }
        }, [meta.page], [meta.limit], sort, eventFilter)

            useEffect(()=> {
            fetchLogs()
            }, [meta.page], fetchLogs, sort, eventFilter)

            const nextPage = () => {
                if (meta.page < ttPages) setMeta(m => ({ ...m, page: m.page + 1 }));
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


            //TRI EVENT
            //TRI SORT
            //CREATION TABLEAU
            //SI LOADING OU PAS LOHGS
            //MAP
            //FOOTER
    return(
        <main className="">
            <div className="">
                <label className="">Trier par:</label>
                <select value={eventFilter} className="" onChange={(e) => setEventFilter(e.target.value)}>
                    <option className="">Toutes</option>
                    {knowEvents.map((l)=> {
                        <option value={l} className="" key={l.id||_id}>{l}</option>
                    })}
                </select>
                <select value={sort} onChange={(e)=> setSort(e.target.value)}>
                    <option value={sort}>Croissant</option>
                    <option value={sort}>Décroissant</option>
                </select>
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
                    {logs.length === 0 (
                        <tr><td colSpan={4}>Aucun logs pour l'instant</td></tr>
                    )}

                    {logs.map((p)=> {
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
                                {p.user}
                            </td>
                        </tr>
                    })}
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