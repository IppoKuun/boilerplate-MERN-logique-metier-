import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import api from "./lib/api";

const getCategories = (products) => {
  const cat = products.map((p) => {p.category})
  const s = new Set([cat])
  return["toutes",... Arrayfrom(s)]}

  const mapSort = (s) => {
    switch(s){
      case "asc": return {sortBy:price, order:asc};
      case "desc": return {sortBy: price, order: desc};
      case "recent" :return {}
    }
  }
export default function Home() {
  const [products, setAllproducts]= useState({})
  const [minPrice, setMinPrice] =useState(0)
  const [maxPrice, setMaxPrice] = useState(100)
  const [category, setCategory] = useState("")

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")

  const params = useMemo (()=> {
    const p = {}
    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p["minPrice"] = minPrice;
    if (maxPrice !== "") p["maxPrice"] = maxPrice;
    //A VOIR PLUS TARD//
    const m = mapSort(p)
    if (m.sortBy) p.sortBy = m.sortBy
    if (m.order) p.order = p.order

    return p
  })

  useEffect(()=> {
    let compAlive = true,
    const controllers = new AbortController()
    setTimeout( async () => {
      try{
        setLoading(true)
        setErr(false)

        const res = await api.get("/products", {params, signal: controllers.signal })

        const safeItems = res?.data.map((i) => ({
          id: i.id || i._id,
          shortDesc: i.shortDesc,
          slug : i.slug,
          images: p.images?.[0],
          category: i.category,
          price: i.price,
          nom: i.nom 
        }))
         if (compAlive) {setAllproducts(safeItems)}


      } catch(e){
        if (compAlive){
          setErr(" Appel d'API échoué")
        }
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => { compAlive= false, controllers.abort(), setTimeout(t) }
  }, [params])  
  const categories = useMemo(() => {getCategories(products)}, [products])

  if (loading) return <main className="min-h-screen p-8">Chargement…</main>;
  if (err)   return <main className="min-h-screen p-8 text-red-600">Erreur : {err}</main>;

  return (
    <div>

    </div>
  );
}
