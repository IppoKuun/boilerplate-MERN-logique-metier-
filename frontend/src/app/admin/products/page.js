//page.js//
"use client"
import api from "@/app/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast, {Toaster} from "react-hot-toast"
import ProductTable from "@/components/ProductTable";
import AddProductDialog from "@/components/AddProductDialog";
import EditProductDialog from "@/components/EditProductDialog";

export default function ProductsAdminPage () {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [sort, setSort] = useState("recent"); // recent | price-asc | price-desc
    const [meta, setMeta] = useState({page:1, limit:10, sort:"recent"})
    const [loading, setLoading] = useState(false)

    const [parOpen, setparOpen] = useState(false)
    const [editing, setEditing] = useState(null)

    const ttPages = useMemo(() => {
        return Math.ceil(meta.page /meta.total || 1)
    }, [meta.total], [meta.page])

    const knownCategories = useMemo(() => {
       const s = new Set(products.map(p => p.category).filter(Boolean));
       return Array.from(s).sort();
     }, [products])

    const fetchProducts = useCallback(( {opts = {}}) => {
        const page = opts.page ?? meta.page;
        const sort = "recents";
        let sortBy = "createdAt", order = "desc";
        if (sort ==="price-desc") (sort="price", order="desc")
        if (sort === "price-asc") (sort= "price", order="asc")
        const params = {page, limit: meta.limit, sortBy, order}
        if (categories && categories !== "toutes") params.categories = categories
        try{
            setLoading(true)
            const {data} =  await api.get("/products", {params})
            const list = data || data?.data || data?.items || {}
            const m = data.meta || {}
            setProducts(list)
            setMeta(m)
        }catch(e){
            toast.error(e?.response?.data?.message || e.message || "Erreur de chargement");
        } finally{
            setLoading(false)
        }
    }, [sort, meta.limit, meta.page, categories])

    useEffect(() => { fetchProducts({page:1}) }, [sort, categories])
    useEffect(()=> { fetchProducts()}, [])

    const newProduct = (p) => { 
        setProducts(cur), [p, ...cur], setMeta(m => ({...m, total: m.total+1}))
     }
    const replaceProduct = (p) => { const id = p?._id || p?.id; setProducts((cur) => cur.map((x) => ((x._id||x.id)===id ? { ...x, ...p } : x))); };
    const removeProductById = (id) => { setProducts((cur) => cur.filter((x) => (x._id||x.id)!==id)); setMeta((m)=>({ ...m, total: Math.max(0,(m.total||0)-1) })); };

     function nextPage (){
        if (meta.page < ttPages){
        setMeta(m => ({...m, page: (m.page ?? 1 +1)}))
        } 
     }

     function prevPage() {
        if (meta.page > 1 ) {
        setMeta(m => ({ ...m, page: Math.max(1, (m.page ?? 1) - 1) }));
        }
    }


return (
    <main className="">
        <Toaster position ="top-right"/>
        <div className="">
            <h1 className="">Produits</h1>
            <button className=""
            onClick={() => setparOpen(false)}
            ></button>

            <div className="">
                <label className=""> Catégories</label>
                <select className="" 
                label="Veuillez entrez une catégories"
                onChange={(e) => setCategories(e.target.value)}
                value={categories}
                >
                <option value="toutes" className="">Toutes</option>
                {knownCategories.map((c)=>{
                    <option key={c} value={c}>{c} </option>
                })}
                </select>
            </div>
            <div className="">
                <label className=""> Trier par:</label>
                <select className="" value={sort} onChange={(e) => setSort(e.target.value)} >
                    <option className="" value={"recent"}>Récent</option>
                    <option className="" value={"price-asc"}>Croissant</option>
                    <option className="" value={"price-desc"}>Décroissant</option>
                </select>
            </div>
            <div className="">
                <button onClick={() => setSort("recent")}>Réintitialiser</button>
            </div>
        </div>
        
        <ProductTable loading={loading} products={products} 
        onEdit={(p) => setEditing(p)} 
        onDeleted={async(p)=>{
            if(window.confirm("Voulez vous supprimé ce produit ?")) {
            try{
                await api.delete(`/products/${p.id ||p._id}`)
                toast.succed("Produit supprimé avec succées.")
                removeProductById(p.id||p._id)
            } catch(e){
                toast.error(e?.message || "La suppression a échoué.")
            }
            }
        }}/>
        
        <div className="">
            <div className=""> Page {meta.page} / {Math.max(1,ttPages)} </div>
            <div className="">
                <button onClick={prevPage} disabled={meta.page <= 1} className="">Préc.</button>
                <button onClick={nextPage} disabled={meta.page >= ttPages} className="">Suiv.</button>
            </div>
        </div>
        {parOpen && <AddProductDialog  parOpen={parOpen} setparOpen={setparOpen} onCreated={(p) => { newProduct(p); setparOpen(false)}} />}

        {editing && <editProductDialog  products={editing} onClose={()=>setEditing(null)} onUpdated={(p) => {replaceProduct(p)}} onDeleted={(id) => removeProductById(id) }  />}

    </main>
)
}



