//AddProductDialog.jsx//
"use client";
import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FormProvider, useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import api from "@/app/lib/api";
import toast from "react-hot-toast";

export default function AddProductDialog({parOpen, setparOpen, onCreated}) {
    const [internalOpen, setInternalOpen] = useState(parOpen)
    useEffect(()=> { parOpen && setparOpen(internalOpen)}, [parOpen])

    const methods = useForm({ 
        defaultValues:{ name: "", description:"", shortDesc:"", price:"", category:"", images:[]}, mode: "onChange" })

    const onSubmit = async (values) => {
        try{
            const {data } = await api.post("/products", values)
            toast.succes(" Produis envoyé avec succès")
            onCreated?.(data);
            methods.reset()
            setparOpen(false)
        } catch (e){
            toast.error(e.message)
        }   
    }

    return (
        <Dialog.root open={parOpen} onOpenChange={(open)=>{ 
            if (!open && methods.formState.isDirty) {
            const ok = window.confirm("Fermer sans enregistrer ?");
            if (!ok) return; 
            } setparOpen(open);
        }} >
            <Dialog.Portal>
                <Dialog.Content className="">
                    <Dialog.Title className="">Créer un produits</Dialog.Title>
                        <FormProvider {...methods}>
                            <ProductForm  onSubmit={methods.handleSubimit(onSubmit(values))} 
                            submiteLabel={methods.formState.isSubmit ? "Enregistrement..." :  "Enregistrer" } />
                        </FormProvider>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.root>
    )
}