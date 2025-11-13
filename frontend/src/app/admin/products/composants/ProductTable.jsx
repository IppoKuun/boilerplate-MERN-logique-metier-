"use client";
//ProductTable.jsx//

export default function ProductTable({ loading, products, onEdit, onDeleted }) {
  const fmtPrice = (v) =>
    v == null ? "—" :
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(v))

  return (
    <div className="card p-0 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 dark:bg-slate-900/40">
          <tr>
            <th className="text-left px-4 py-2 font-medium">Nom</th>
            <th className="text-left px-4 py-2 font-medium">Prix</th>
            <th className="text-left px-4 py-2 font-medium">Catégories</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className="px-4 py-3 text-slate-500" colSpan={4}>Chargement…</td>
            </tr>
          )}
          {!loading && products.length === 0 && (
            <tr>
              <td className="px-4 py-3 text-slate-500" colSpan={4}>Aucun produit pour l'instant</td>
            </tr>
          )}
          {!loading && products.map((p) => (
            <tr key={p.id || p._id} className="border-t border-slate-200/60 dark:border-slate-800/60">
              <td className="px-4 py-3">{p.name || p.nom || p.slug || "(sans nom)"}</td>
              <td className="px-4 py-3">{fmtPrice(p.price)}</td>
              <td className="px-4 py-3">
                {Array.isArray(p.categories) ? p.categories.join(", ") : (p.category || p.categories || "—")}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <button className="btn" onClick={() => onEdit(p)}>Modifier</button>
                  <button className="btn-primary" onClick={() => onDeleted(p)}>Supprimer</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
