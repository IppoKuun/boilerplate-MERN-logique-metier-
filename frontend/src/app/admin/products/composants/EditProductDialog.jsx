"use client";
import React, { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FormProvider, useForm } from "react-hook-form";
import ProductForm from "./ProductForm";
import api from "@/app/lib/api";
import toast from "react-hot-toast";
import React from "react";
import ProductForm from "./ProductForm";

export default function EditProductDialog({editProduct, onClose, onUpdated, onDeleted}){
    const [open, setOpen] = useState(!!product)
    useEffect(()=> {methods.reset(editProduct)}, [editProduct])

    const onSubmit = async (values) => {
        try{
            const {data} =  api.patch("products", values);
            toast.succes("Le produit a été modifié avec succés")
            setOpen(false)
            onUpdated(data || data?.data)
            onClose()
        } catch(e){
            toast.error(err.msg)
        }

    }

    return(
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
                            submiteState={methods.formState.isSubmit ? "Enregistrement..." :  "Enregistrer les modifications" } />
                        </FormProvider>
                </Dialog.content>
            </Dialog.Portal>
        </Dialog.root>
    )
}
    
