import api from "@/app/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast, {Toaster} from "react-hot-toast"

export default function page () {
    const [products, setProducts] = useState({})
    const [categories, setCategories] = useState([])
    const [sort, setSort] = useState("recent"); // recent | price-asc | price-desc
    const [meta, setMeta] = useState({page:1, limit:10, sort:"recent"})
    const [loading, setLoading] = useState(false)

    const [open, setOpen ] = useState(false)
    const [editing, setEditing] = useState(null)

    const ttPages = useMemo(()=> {
        Math.ceil(meta.page /meta.total || 0)
    }, [meta.limit], [meta.page])

    const getCategories = useMemo(() => {
        const s = new Set([])
        categories.map((c) => { if (categories) s.add(c.categories)})
        return Array.from(s).sort()
    }, [products])

    const fetchProducts = useCallback(( {opts = {}}) => {
        const page = opts.page ?? meta.page;
        const sort = "recents"
        if (sort ==="price-desc") (sort="price", order="desc")
        if (sort === "price-asc") (sort= "price", order="asc")
        const params = {page, limit: meta.limit, sortBy, order}
        if (categories) params.categories = categories
        try{
            setLoading(true)
            const {data} = api.get("/products", {params})
            const list = data || data.data || data.items || {}
            const m = data.meta || {}
            setProducts(list)
            setMeta(m)
        }catch(e){
            toast.error(e?.response?.data?.message || e.message || "Erreur de chargement");
        } finally{
            setLoading(false)
        }
    }, [sort, products, categories])

    useEffect(() => { fetchProducts({page:1})}, [sort, categories])
    useEffect(()=> { fetchProducts()}, [])

    const newProduct = (p) => { 
        setProducts((cur), [p, ...cur], setMeta(m, [...m, m.total+1]))
     }
    const replaceProduct = (p) => { const id = p?._id || p?.id; setProducts((cur) => cur.map((x) => ((x._id||x.id)===id ? { ...x, ...p } : x))); };
    const removeProductById = (id) => { setProducts((cur) => cur.filter((x) => (x._id||x.id)!==id)); setMeta((m)=>({ ...m, total: Math.max(0,(m.total||0)-1) })); };

     function nextPage (){
        if (meta.page < ttPages){
        const next = meta.page +1;
        setMeta(...m, next)
        } 
     }

     function prevPage() {
        if (meta.page > 1 ) {
        const next = meta.page -1;
        setMeta(...m, next)
        }
    }


return (
    <main className="">
        <Toaster position ="top-right"/>
        <div className="">
            <h1 className="">Produits</h1>
            <button className=""
            onClick={setOpen(false)}
            ></button>

            <div className="">
                <label className=""> Catégories</label>
                <select className="" 
                label="Veuillez entrez une catégories"
                onChange={(e) => setCategories(e.target.value)}
                value={categories}
                >
                <option className="">Toutes</option>
                {categories && categories.map((c)=>{
                    <option key={c.id || c._id} value={c}>{c} </option>
                })}
                </select>
            </div>
            <div className="">
                <label className=""> Trier par:</label>
                <select className="" value={sort} onChange={(e) => setSort(e.target.value)} >
                    <option className="" value={"recent"}>Récent</option>
                    <option className="" value={"price-desc"}>Croissant</option>
                    <option className="" value={"price-asc"}>Décroissant</option>
                </select>
            </div>
            <div className="">
                <button onClick={setSort("recent")}>Réintitialiser</button>
            </div>
        </div>
        
        <ProductTable loading={loading} products={products} 
        onEdit={(p) => setEditing(p)} 
        onDeleted={async(p)=>{
            if(!window.confirm("Voulez vous supprimé ce produit ?")) {
            try{
                await api.get(`/products/${p.id ||p._id}`)
                toast.succed("Produit supprimé avec succées.")
                removeProductById(p.id||p._id)
            } catch(e){
                toast.error(e.message || "La suppression a échoué.")
            }
            }
        }}/>
        
        <div className="">
            <div className=""> Page {meta.page} / {Math.max(1,ttPages)} </div>
            <div className="">
                <button onClick={prevPage} disabled={meta.page < 1} className=""> </button>
                <button onClick={prevPage} disabled={meta.page > ttPages} className=""> </button>
            </div>
        </div>
        {open && <AddProductDialog  open={open} setOpen={setOpen} onCreated={(p) => { newProduct(p); setOpen(false)}} />}

        {editing && <editProductDialog  products={products} onUpdated={(p) => {replaceProduct(id)}} onDeleted={(id) => removeProductById(id) }  />}

    </main>
)
}



