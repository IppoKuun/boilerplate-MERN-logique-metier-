"use client";
//EditProductDialog.jsx//

import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FormProvider, useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import api from "@/app/lib/api";
import toast from "react-hot-toast";

export default function EditProductDialog({ editProduct, onClose, onUpdated, onDeleted }) {
  const [open, setOpen] = useState(!!editProduct)
  const [allowCat, setAllowCat] = useState([])
  const methods = useForm({ defaultValues: editProduct || {} })

  useEffect(() => { methods.reset(editProduct || {}) }, [editProduct]) // sync valeurs

      useEffect(()=> {
          let alive = true
          async function allCat(){
          const res = await api.get("/products/categories")
          const cat = Array.isArray(res?.categories) ? res.categories : res;
          if (alive) setAllowCat(cat)
          }
          allCat()
          return () => { alive = false}
      }, [])

  const onSubmit = async (values) => {
    try {
      const res = await api.patch(`/products/${editProduct?._id || editProduct?.id}`, values)
      toast.success("Le produit a été modifié avec succès")
      setOpen(false)
      onUpdated(res || res?.data)
      onClose && onClose()
    } catch (e) {
      toast.error(e?.msg || e?.message || "Erreur de mise à jour")
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) { setOpen(false); onClose && onClose() } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 card p-4 space-y-3">
          <Dialog.Title className="text-lg font-semibold">Modifier le produit</Dialog.Title>
          <FormProvider {...methods}>
            <ProductForm
              onSubmit={methods.handleSubmit(onSubmit)}
              submitLabel={methods.formState.isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
              onDeleted={onDeleted ? () => onDeleted(editProduct?._id || editProduct?.id) : undefined}
              categories = {allowCat}
            />
          </FormProvider>
          <div className="flex justify-end">
            <Dialog.Close className="btn">Fermer</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
