"use client"
import api from "@/app/lib/api"
import { useCallback, useEffect, useMemo, useState } from "react"



export default async function LogsPage(){
    const [logs, setLogs] = useState({})
    const [meta, setMeta]= useState({ page:1, limit:30})
    const [events, setEvents]= useState("toutes")
      // calcul du total de pages

      const ttPages = useMemo(()=> {
        const tt = Math.ceil(meta.total / meta.limit)
        return tt
      }, [meta.page, meta.limit, meta.total])

    //EXTRAIRE EVENNEMENT EN ARRAY 

        const knowEvents = useMemo(()=> {
            const event = logs.map((l)=> l.event)
            const s = new Set ([Array.from(event).sort()])
            return s
        }, [logs])


        const fetchLogs = useCallback(()=> {
        try{
        const {data} = api.get("/products")
        setLogs(data.data || data.items || {})
        setMeta(data.meta)
        } catch(e){

        }
        })

            useEffect(()=> {
            fetchLogs
            }, [])

    //fetch
      // Useffect page/tri/filtre déclenchent un fetch

  // handlers pagination

      // reset filtres


    return(
        <main className="">

        </main>
    )

}