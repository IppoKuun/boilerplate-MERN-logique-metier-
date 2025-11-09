"use client"
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import api from "./lib/api";

const getCategories = (products) => {
  const cat = products.map((p) => (p.category))
  const s = new Set(cat)
  return["toutes",... Array.from(s)]
}

export default function Home() {
  const [products, setAllproducts]= useState([])
  const [minPrice, setMinPrice] =useState(0)
  const [maxPrice, setMaxPrice] = useState(100)
  const [category, setCategory] = useState("")

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState("")
  const [sort, setSort] = useState("default")
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [meta, setMeta] = useState(null); 


  const params = useMemo (()=> {
    const p = {}

    if (category && category !== "toutes") p.category = category;
    if (minPrice !== "") p.minPrice = Number(minPrice);
    if (maxPrice !== "") p.maxPrice = Number(maxPrice);

  if (sort === "asc" || sort === "desc") {
    p.sortBy = "price";
    p.order = sort;}
    p.page = page;
    p.limit = limit;
    return p
  }, [category, minPrice, maxPrice, page, limit, sort])



    useEffect(() => { setPage(1); }, [category, minPrice, maxPrice]);


  useEffect(()=> {
    const controllers = new AbortController()
    const t = setTimeout( async () => {
      try{
        setLoading(true)
        setErr("")

        const res = await api.get("/products", {params, signal: controllers.signal })

          const metaFromApi =
          res?.data?.meta ||            
          res?.data?.pagination || null;

            setMeta(metaFromApi);

        const safeItems = res?.data.items.map((i) => ({
          id: i.id || i._id,
          shortDesc: i.shortDesc,
          slug : i.slug,
          images: i.images?.[0],
          category: i.category,
          price: i.price,
          nom: i.nom 
        }))
        {setAllproducts(safeItems)}

      } catch(e){
          setErr(" Appel d'API échoué")
        
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => { controllers.abort(); clearTimeout(t) }
  }, [params])  

  const categories = useMemo(() => getCategories(products), [products])

  const resetFilter = () => {
    setMinPrice(0)
    setMaxPrice(100)
    setCategory("toutes")
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
              {categories.map((c) => (
              <option key={c} >{c} </option>
            ))}
            </select>
          </label>
          <label className="">
            <input
            type="number"
            placeholder="Entez un chiffre"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className=""
            ></input>
          </label>
          <label className="">
            <input
              type="number"
              placeholder="Entez un chiffre"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className=""
            ></input>
            </label> 

            <label className="">
              <span className="">Trier par :</span>
              <select className="" value={sort} onChange={((e)=> setSort(e.target.value) )}>
                <option className="" value="default" >Défault</option>
                <option className="" value="asc">Croissant</option>
                <option className=""value="desc" >Décoissant</option>
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
            <Link key={p.id} href={`/products/${p.slug}`}>
            <article className="">
              <Image
                src={p.images.secure_url}
                alt={p.nom}
                width={400}
                height={400}
              />
              <div className="">
                <span className=""> {p.price}</span>
                <span className=""> {p.category} </span>
                <span className=""> {p.nom}</span>
                <span className=""> {p.shortDesc} </span>
              </div>
            </article>
            </Link>

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
