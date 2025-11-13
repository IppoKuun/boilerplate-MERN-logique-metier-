"use client";
//AddProductDialog.jsx//

import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FormProvider, useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import api from "@/app/lib/api";
import toast from "react-hot-toast";


export default function AddProductDialog({parOpen, setparOpen, onCreated}) {
    const [internalOpen, setInternalOpen] = useState(parOpen)
    const [allowCat, setAllowCat] = useState([])
    useEffect(()=> { parOpen && setparOpen(internalOpen)}, [parOpen])
    
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



    const methods = useForm({ 
        defaultValues:{ name: "", description:"", shortDesc:"", price:"", category:"", images:[]}, mode: "onChange" })

    const onSubmit = async (values) => {
        try{
            const res  = await api.post("/products", values)
            toast.success(" Produis envoyé avec succès")
            onCreated?.(res.product);
            methods.reset()
            setparOpen(false)
            } catch (e) {
            toast.error(e?.msg || e?.data?.error || e?.message || "Impossible de créer le produit");
            console.error(e)
            }
  
    }

    return (
        <Dialog.Root open={parOpen} onOpenChange={(open)=>{ 
            if (!open && methods.formState.isDirty) {
            const ok = window.confirm("Fermer sans enregistrer ?");
            if (!ok) return; 
            } setparOpen(open);
        }} >
            <Dialog.Portal>
                <Dialog.Content className="">
                    <Dialog.Title className="">Créer un produits</Dialog.Title>
                        <FormProvider {...methods}>
                            <ProductForm  onSubmit={methods.handleSubmit(onSubmit)} 
                            submitLabel={methods.formState.isSubmitting ? "Enregistrement..." :  "Enregistrer"}
                                categories = {allowCat}
                              />
                        </FormProvider>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}