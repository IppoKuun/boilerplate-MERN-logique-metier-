"use client";
//page.js//

import api from "@/app/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast"
import ProductTable from "@/app/admin/products/composants/ProductTable";
import AddProductDialog from "@/app/admin/products/composants/AddProductDialog";
import EditProductDialog from "@/app/admin/products/composants/EditProductDialog";

export default function ProductsAdminPage () {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState("toutes")
  const [sort, setSort] = useState("recent") // recent | price-asc | price-desc
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, sort: "recent" })
  const [loading, setLoading] = useState(false)

  const [parOpen, setparOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const ttPages = useMemo(() => {
    const total = Number(meta.total || 0)
    const limit = Number(meta.limit || 10)
    return Math.max(1, Math.ceil(total / limit))
  }, [meta.total, meta.limit])

  const knownCategories = useMemo(() => {
    const s = new Set(
      products
        .map(p => p.category || p.categories)
        .filter(Boolean)
    )
    return Array.from(s).sort()
  }, [products])

  const fetchProducts = useCallback(async ({ opts = {} } = {}) => {
    try {
      const page = opts.page ?? meta.page
      let sortBy = "createdAt", order = "desc"
      if (sort === "price-desc") { sortBy = "price"; order = "desc" }
      if (sort === "price-asc")  { sortBy = "price"; order = "asc" }

      const params = { page, limit: meta.limit, sortBy, order }
      if (categories && categories !== "toutes") params.category = categories

      setLoading(true)
      // Axios renvoie déjà "data" → pas de { data: ... }
      const res = await api.get("/products", { params })
      const list = res?.items ?? res?.data ?? res ?? []
      const m = res?.meta ?? { total: Array.isArray(list) ? list.length : 0, page, limit: meta.limit }

      setProducts(Array.isArray(list) ? list : [])
      setMeta(prev => ({ ...prev, ...m, page }))
    } catch (e) {
      toast.error(e?.msg || e?.data?.error || e?.message || "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [sort, meta.limit, meta.page, categories])

  useEffect(() => { fetchProducts({ opts: { page: 1 } }) }, [sort, categories, fetchProducts])
  useEffect(() => { fetchProducts() }, []) // init

  const newProduct = (p) => {
    setProducts(cur => [p, ...(cur || [])])
    setMeta(m => ({ ...m, total: Number(m.total || 0) + 1 }))
  }

  const replaceProduct = (p) => {
    const id = p?._id || p?.id
    setProducts(cur => (cur || []).map(x => ((x._id || x.id) === id ? { ...x, ...p } : x)))
  }

  const removeProductById = (id) => {
    setProducts(cur => (cur || []).filter(x => (x._id || x.id) !== id))
    setMeta(m => ({ ...m, total: Math.max(0, Number(m.total || 0) - 1) }))
  }

  function nextPage (){
    if (meta.page < ttPages){
      setMeta(m => ({ ...m, page: (Number(m.page || 1) + 1) }))
      fetchProducts({ opts: { page: Number(meta.page || 1) + 1 } })
    }
  }

  function prevPage() {
    if (meta.page > 1 ) {
      setMeta(m => ({ ...m, page: Math.max(1, Number(m.page || 1) - 1) }))
      fetchProducts({ opts: { page: Math.max(1, Number(meta.page || 1) - 1) } })
    }
  }

  return (
    <main className="p-6 md:p-8 space-y-6">
      <Toaster position="top-right" />
      <div className="flex flex-wrap items-end gap-4">
        <h1 className="text-2xl font-semibold text-brand-600">Produits</h1>

        <button
          className="btn-primary"
          onClick={() => setparOpen(true)}
        >
          Nouveau produit
        </button>

        <div className="card p-3 flex items-center gap-3">
          <label className="text-sm text-slate-500">Catégories</label>
          <select
            className="input w-56"
            onChange={(e) => setCategories(e.target.value)}
            value={categories}
            aria-label="Filtrer par catégories"
          >
            <option value="toutes">Toutes</option>
            {knownCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="card p-3 flex items-center gap-3">
          <label className="text-sm text-slate-500">Trier par</label>
          <select
            className="input w-48"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Récent</option>
            <option value="price-asc">Croissant</option>
            <option value="price-desc">Décroissant</option>
          </select>
        </div>

        <div>
          <button className="btn" onClick={() => setSort("recent")}>Réinitialiser</button>
        </div>
      </div>

      <ProductTable
        loading={loading}
        products={products}
        onEdit={(p) => setEditing(p)}
        onDeleted={async (p) => {
          if (window.confirm("Voulez-vous supprimer ce produit ?")) {
            try {
              await api.delete(`/products/${p.id || p._id}`)
              toast.success("Produit supprimé avec succès.")
              removeProductById(p.id || p._id)
            } catch (e) {
              toast.error(e?.msg || e?.message || "La suppression a échoué.")
            }
          }
        }}
      />

      <div className="flex items-center justify-between card p-3">
        <div className="text-sm text-slate-600">
          Page {meta.page} / {Math.max(1, ttPages)}
        </div>
        <div className="flex gap-2">
          <button onClick={prevPage} disabled={meta.page <= 1} className="btn">Préc.</button>
          <button onClick={nextPage} disabled={meta.page >= ttPages} className="btn-primary">Suiv.</button>
        </div>
      </div>

      {parOpen && (
        <AddProductDialog
          parOpen={parOpen}
          setparOpen={setparOpen}
          onCreated={(p) => { newProduct(p); setparOpen(false) }}
        />
      )}

      {editing && (
        <EditProductDialog
          editProduct={editing}
          onClose={() => setEditing(null)}
          onUpdated={(p) => { replaceProduct(p) }}
          onDeleted={(id) => removeProductById(id)}
        />
      )}
    </main>
  )
}
