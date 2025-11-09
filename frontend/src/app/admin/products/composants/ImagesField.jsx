//ImagesFields//
"use client";
import React from "react";
import { useFormContext } from "react-hook-form";
import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import api from "@/app/lib/api";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const getCloudinarySignature = async () => {
    const { data }= await api.post("/cloudinary/sign", {folder:"products"})
    return data
} 

async function uploadToCloudinary(files) {
    if(!CLOUD_NAME) {throw new Error({message : "Clé Cloudinary manquant"})};
    const sig = await getCloudinarySignature()
    const form = new FormData()
    form.append("files", files)
    form.append("sign", sig.signatures)
    form.append("timestamp", sig.timestamp )
    if (sig.folder) form.append("folder", sig.folder);
    form.append("signature", sig.signature);
    form.append("api_key", sig.apiKey)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, 
    { method: "POST", body: form });
    const json= await res.json()
    if(!json) {throw new Error({message: "Erreur d'upload cloudinary"})}
    return{ public_id : json.public_id, url: json.secure_url }
}

    function SortableImage({ id, url, alt }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };
     return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative flex items-center gap-3 rounded-xl border p-2 bg-white ${isDragging?"shadow-xl ring-2 ring-indigo-500":""}`}>
      <img src={url} alt={alt||"image"} className="h-16 w-16 rounded-md object-cover select-none" draggable={false} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{alt || "(sans alt)"}</div>
        <div className="text-xs text-gray-500 truncate">{id}</div>
      </div>
    </div>
    );
    }


    export default function ImagesField({fields}){
        const {watch, setValue} = useFormContext()
        const images= watch(fields)

        const uploadFiles = async (files) => {
            if(!files) return
            const uploads = Array.from(files).slice(0, 20- images.length)
            const result = await Promise.all(uploads.map(f => uploadToCloudinary(f)))
            const nvArray = [...images, ...result]
            setValue(fields, nvArray, {isDirty: true})
        }
        const onDragEnd = (event) => {
            const { active, over } = event; if (!over || active.id === over.id) return;
            const oldIndex = images.findIndex((x)=>x.public_id===active.id);
            const newIndex = images.findIndex((x)=>x.public_id===over.id);
            const next = arrayMove(images, oldIndex, newIndex);
            setValue(fields, next, { shouldDirty: true });
        };
              const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor)
    );

        
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Images (max 20) — La 1ʳᵉ est la couverture</label>
      <input type="file" accept="image/*" multiple onChange={(e)=> uploadFiles(e.target.files)} />
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={images.map((x)=>x.public_id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {images.length===0 && (<div className="text-sm text-gray-500">Aucune image pour l'instant.</div>)}
            {images.map((img)=> (
              <SortableImage key={img.public_id} id={img.public_id} url={img.url} alt={img.alt} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

