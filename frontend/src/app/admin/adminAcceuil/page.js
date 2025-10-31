import api from "@/app/lib/api"
import { useEffect, useState } from "react"
import Image from "next/image"

const [recentProducts, setRecentProducts] = useState([])
const [recentAudits, setRecentsAudits] = useState([])
const [health, setHealth] = useState("")
const [ttProd, setTtprod] = useState(0)
const [err, setErr] = useState(null)
const [loading, setLoading] = useState(false)

useEffect(() => {
    const controller = new AbortController()
    async() => {
        try{
            setLoading(true)
            const [{data:h}, {data:p}, {data:a}] = Promise.all([
                api.get("/health", {signal: controller.signal}),
                api.get("/products", {params: {limit:5, sortBy: "desc"},  signal: controller.signal}),
                api.get("/audits", {params: {limit:5, sortBy: "desc"},  signal: controller.signal}),
            ])
        } catch(e) {
            if (e.message !== "CanceledError") setErr(e.message)
        } finally{ 
            setLoading(false)
        }
    setHealth(h.ok ? "up" :"down")
    setRecentProducts(p.items ?? [])
    setRecentsAudits(a.items ?? [])
    setTtprod()
    }
    return () => controller.abort()

}, [])

    if (loading) return(<div className="" loading label="Initiatialisation du dashboard"> </div>)


return(
    <main className="">
              {err && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded">{err}</div>
        )}
            <h1 className=""> Admin - Dashboard</h1>
        <div className="">
            <section className="">
                <span className=""> Santé du serveur </span>
                <span
                    className={`mt-1 inline-block px-2 py-0.5 rounded text-sm font-medium
                        ${health === "up"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"}`}
                    >
                    {health}
                </span>
            </section>
            <section className="">
                <span className=""> Produit dans la boutiques</span>
                <span className=""> {ttProd ?? 0}</span>
            </section>
        </div>
        <section className="">
            <div className="">
                <span className="">5 Dernier produits</span>
                <ul className="">
                    {recentProducts.map((p) => {
                        <li key={p._id} className="">
                            <div className="">
                                <Image 
                                src={p.image}
                                />
                                <span className=""> {p.slug} </span>
                                <div className="text-xs text-gray-500">
                                    {p.price != null
                                    ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(p.price)
                                    : "—"}
                                </div>
                            </div>
                        </li>
                    })}
                </ul>
            </div>
            <div className="">
                <p className=""> 5 Dernier Audits </p>
                <ul className="">
                    {recentAudits.map((a) => {
                        <li key={a._id || a.id} className="flex items-start gap-3">
                              <span className="mt-1 text-xs px-2 py-0.5 rounded bg-gray-100">{a?.event }</span>
                              <span className="">{a.actor.user} </span>
                              <span className=""> {a.ts} </span>
                        </li>
                    })}
                </ul>

            </div>
        </section>
    </main>

)