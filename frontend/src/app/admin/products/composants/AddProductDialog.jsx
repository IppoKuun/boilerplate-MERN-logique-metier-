"use client";
import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/reacMais t-dialog";
import { FormProvider, useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import api from "@/app/lib/api";
import toast from "react-hot-toast";

export default function AddProductDialog(parOpen, setparOpen, onCreated) {
    const [internalOpen, setInternalOpen] = useState(parOpen)
    useEffect(()=> { parOpen && setparOpen(internalOpen)}, [internalOpen])

    const methods = useForm({ 
        defaultValues:{ nom: "", description:"", shortDesc:"", price:"", category:"", images:[], mode: onchange }})

    const onSubmit = async(values) => {
        try{
            const {data } = await api.post("/products", values)
            toast.succes(" Produis envoyé avec succès")
        } catch (e){
            toast.error(e.message)
        }
        onCreated?.(data);
        methods.reset ()
    }

    return (
        <Dialog.root open={parOpen} onOpenChange={(e)=>{ 
        const e = (!window.confirm("Voulez vous fermer la page ?"));
        if (e && methods.formState.isDirty) {
            setInternalOpen(false)
        } else {
            setInternalOpen(true)
        }
        }} >

            <Dialog.Portal>
                <Dialog.content className="">
                    <Dialog.Title className=""></Dialog.Title>
                        <FormProvider {...methods}>
                            <ProductForm  onSubmit={handleSubimit(onSubmit(values))} 
                            submiteState={methods.formState.isSubmit ? "Enregistrement..." :  "Enregistrer" } />
                        </FormProvider>
                </Dialog.content>
            </Dialog.Portal>
        </Dialog.root>
    )
}