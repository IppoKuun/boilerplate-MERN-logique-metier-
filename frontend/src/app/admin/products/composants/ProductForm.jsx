"use client";
//ProductForm.jsx//

import ImagesField from "./ImagesField";
import { useFormContext } from "react-hook-form";

export default function ProductForm({ onSubmit, submitLabel, onDeleted, categories = [] }) {
  const { register, formState: { errors, isSubmitting } } = useFormContext()

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {Boolean(errors && Object.keys(errors).length) && (
        <p className="text-sm text-red-500">Veuillez corriger les champs requis.</p>
      )}

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Nom *</label>
        <input className="input" placeholder="Produit" {...register("name", { required: true })} />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Prix *</label>
        <input className="input" placeholder="0.00" type="number" step="0.01" {...register("price", { required: true })} />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Description courte</label>
        <input className="input" placeholder="…" {...register("shortDesc")} />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Description</label>
        <textarea rows={4} className="input" placeholder="Détails, matière, …" {...register("description")} />
      </div>
      
      <div className="space-y-1">
        <label className="text-sm text-slate-600">Choisissez</label>
        <select className="input" {...register("category", { required: true })}>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>


      <ImagesField fields="images" />

      <div className="flex flex-wrap gap-2 pt-2">
        {onDeleted && (
          <button className="btn" type="button" onClick={onDeleted}>Supprimer le produit</button>
        )}
        <button className="btn" type="button" onClick={() => { history.back() }}>Annuler</button>
        <button className="btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enregistrement..." : (submitLabel || "Enregistrer")}
        </button>
      </div>
    </form>
  )
}
