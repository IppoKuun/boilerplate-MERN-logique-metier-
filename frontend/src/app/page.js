"use client"

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [meta, setMeta] = useState(null); 


  const params = useMemo (()=> {
    const p = {}
    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p["minPrice"] = minPrice;
    if (maxPrice !== "") p["maxPrice"] = maxPrice;

    const m = mapSort(p)
    if (m.sortBy) p.sortBy = m.sortBy
    if (m.order) p.order = p.order

    p.page = page;
    p.limit = limit;
    return p
  }, [category, minPrice, maxPrice, sortBy, page, limit])

    // Exemples possibles : adapte aux clés de ton buildMeta
  const metaFromApi =
    res?.data?.meta ||               // { page, limit, total, totalPages, ... }
    res?.data?.pagination || null;

  if (alive) setMeta(metaFromApi);

    useEffect(() => { setPage(1); }, [category, minPrice, maxPrice, sortBy]);


  useEffect(()=> {
    let compAlive = true
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

  const resetFilter = () => {
    setMinPrice(0)
    setMaxPrice(50)
    setCategory("Trié par défault")
  }

  if (loading) return <main className="min-h-screen p-8">Chargement…</main>;
  if (err)   return <main className="min-h-screen p-8 text-red-600">Erreur : {err}</main>;

  return (
    <div>
      <main className="">
        <section className="">
          <h1 className=""> Bienvenue sur NodeShop </h1>
          <h2 className=""> Le shop moderne, simple et rapide</h2>
          <p className="">NodeShop réunit le meilleur du minimalisme et du confort.</p>
          <button 
            onClick={()=> {document.getElementById('products').scrollIntoView({ behavior: 'smooth' });}}
          className="">Découvrir nos produits</button>
        </section>
          <div className="">
            <label className="">
              <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => {
              <option key={c.id}>{c.nom} </option>
            })}
            </select>
          </label>
          <label className="">
            <input
            type="Number"
            placeholder="Entez un chiffre"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className=""
            ></input>
          </label>
          <label className="">
            <input
              type="Number"
              placeholder="Entez un chiffre"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className=""
            ></input>
            </label> 

            <label className="">
              <span className="">Trier par :</span>
              <select className="">
                <option className="" value={"Default"}>Défault</option>
                <option className="" value={"asc"}>Croissant</option>
                <option className="" value={"desc"}>Décoissant</option>
              </select>
            </label>
            <label className="">
              <button
              onClick={resetFilter}
              className=""
              > Reinitialisé les filtres </button>
            </label>
        </div>
        <section id="products" className="">
          <span className=""> Nos produits </span>
          {products.map((p) => (
            <article key={p.id} className="">
              <img src={p.products} alt={p.nom} ></img>
              <div className="">
                <span className=""> {p.price}</span>
                <span className=""> {p.category} </span>
                <span className=""> {p.nom}</span>
                <span className=""> {p.shortDesc} </span>
                <Link href={`/products/${p.slug}`}></Link>
              </div>
            </article>
          ))}
        </section>
          {products.length === 0 &&(
            <p className="">
              Aucun produit disponible.
            </p>
          )}
      </main>
      <div className="mt-8 flex items-center justify-between">
          <button
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            ← Précédent
          </button>

          <div className="text-sm text-gray-700">
            Page {meta?.page ?? page} / {meta?.totalPages ?? "?"}
          </div>

          <button
            className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
            onClick={() => setPage(p => p + 1)}
            disabled={meta?.totalPages ? page >= meta.totalPages : false}
          >
            Suivant →
          </button>
      </div>

    </div>
  );
}
