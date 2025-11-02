"use client";

// ========================
// Admin Produits (Next.js App Router, JS)
// - Liste + filtres (catégorie, tri)
// - Bouton "Ajouter" → Dialog (modale) avec formulaire RHF+Zod
// - Édition par ligne via petit menu → Dialog
// - Upload Cloudinary signé + drag & drop d'images (@dnd-kit)
// - Toasts de succès/erreur
// - PATCH par ID, slug immuable côté back
//
// Dépendances à installer :
//   npm i axios react-hook-form zod @hookform/resolvers react-hot-toast
//   npm i @radix-ui/react-dialog @radix-ui/react-dropdown-menu
//   npm i @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
//
// Pré-requis côté front :
//   - Tailwind configuré
//   - axios préconfiguré dans '@/lib/api' (baseURL + interceptors + auth)
//   - process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME défini
//
// Pré-requis côté back (exemples d'API attendues) :
//   - GET    /products?category=&page=&limit=&sortBy=&order=
//            => { data: [ { _id, name, price, category, images: [{public_id,url,alt}], ... } ], meta: { page, limit, total, sortBy, order } }
//   - POST   /products  (body: { name, price, category, images: [{public_id,url,alt}], ... }) => { data: product }
//   - PATCH  /products/:id  (id = _id en Mongo)
//   - DELETE /products/:id
//   - POST   /cloudinary/sign  (body: { folder: 'products' }) => { signature, timestamp, apiKey, folder }
//     (signature calculée côté serveur avec api_secret)
//
// NB: Pour simplifier, on dérive la liste des catégories depuis les produits chargés.
// ========================

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import api from "@/lib/api";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; // ex: "demo"

// ====== Zod Schemas ======
const ImageSchema = z.object({
  public_id: z.string().min(1),
  url: z.string().url(),
  alt: z.string().optional().default(""),
});

const ProductSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  price: z.coerce.number().min(0, "Prix ≥ 0"),
  category: z.string().min(1, "Catégorie requise"),
  shortDesc: z.string().max(160, "160 caractères max").optional().or(z.literal("")),
  description: z.string().max(2000, "2000 caractères max").optional().or(z.literal("")),
  active: z.boolean().default(true),
  images: z.array(ImageSchema).max(20, "Max 20 images").default([]),
});

// ====== Helpers ======
function getId(p) {
  return p?._id || p?.id; // compat
}

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

async function getCloudinarySignature() {
  // Doit répondre { signature, timestamp, apiKey, folder }
  const { data } = await api.post("/cloudinary/sign", { folder: "products" });
  return data;
}

async function uploadToCloudinary(file) {
  if (!CLOUD_NAME) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME manquant");
  const sig = await getCloudinarySignature();
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", sig.timestamp);
  if (sig.folder) form.append("folder", sig.folder);
  form.append("signature", sig.signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error?.message || "Upload Cloudinary échoué");
  return { public_id: json.public_id, url: json.secure_url, alt: "" };
}



// ====== Sortable Image Item ======
function SortableImage({ id, url, alt }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "relative flex items-center gap-3 rounded-xl border p-2 bg-white cursor-move select-none",
        isDragging && "shadow-xl ring-2 ring-indigo-500"
      )}
      {...attributes}
      {...listeners}
      title="Glisser pour changer l'ordre (la première = couverture)"
    >
      <img
        src={url}
        alt={alt || "image"}
        className="h-16 w-16 rounded-md object-cover"
        draggable={false}
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{alt || "(sans alt)"}</div>
        <div className="text-xs text-gray-500 truncate">{id}</div>
      </div>
    </div>
  );
}

function ImagesField({ name }) {
  const methods = useFormContextSafe();
  const images = methods.watch(name) || [];
  const setValue = methods.setValue;

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const sensors = useSensors(mouseSensor, touchSensor);

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((x) => x.public_id === active.id);
    const newIndex = images.findIndex((x) => x.public_id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    setValue(name, reordered, { shouldDirty: true });
  };

  const onFiles = async (files) => {
    try {
      if (!files?.length) return;
      const uploads = Array.from(files).slice(0, 20 - images.length);
      const promises = uploads.map((f) => uploadToCloudinary(f));
      toast.promise(Promise.all(promises), {
        loading: "Upload des images…",
        success: (arr) => {
          const next = [...images, ...arr];
          setValue(name, next, { shouldDirty: true });
          return `${arr.length} image(s) ajoutée(s)`;
        },
        error: (err) => err.message || "Échec de l'upload",
      });
    } catch (e) {
      toast.error(e.message || "Échec de l'upload");
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">Images (drag & drop pour l'ordre, la première = couverture)</label>
      <div className="flex items-center gap-3">
        <input type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} />
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <SortableContext items={images.map((x) => x.public_id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {images.map((img, idx) => (
              <div key={img.public_id}>
                {idx === 0 && (
                  <div className="text-xs text-indigo-600 mb-1">Couverture</div>
                )}
                <SortableImage id={img.public_id} url={img.url} alt={img.alt} />
              </div>
            ))}
            {images.length === 0 && (
              <div className="text-sm text-gray-500">Aucune image pour l'instant.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function useFormContextSafe() {
  // petite aide pour typer correctement sans TS : on suppose FormProvider
  const ctx = React.useContext(require("react-hook-form").FormContext);
  if (!ctx) throw new Error("ImagesField doit être rendu dans <FormProvider>");
  return ctx;
}

function ProductForm({ defaultValues, onSubmit, submitLabel }) {
  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: "",
      price: "",
      category: "",
      shortDesc: "",
      description: "",
      active: true,
      images: [],
      ...defaultValues,
    },
    mode: "onChange",
  });

  const { register, handleSubmit, formState, setValue, watch } = methods;
  const { isSubmitting, isDirty, errors } = formState;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom *</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: T-shirt bleu"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prix (€) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="0.00"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Catégorie *</label>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ex: T-shirts"
              {...register("category")}
            />
            {errors.category && (
              <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>
            )}
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input id="active" type="checkbox" {...register("active")} />
            <label htmlFor="active" className="text-sm text-gray-700">Actif (visible en boutique)</label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description courte</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Max 160 caractères"
            {...register("shortDesc")}
          />
          {errors.shortDesc && (
            <p className="text-xs text-red-600 mt-1">{errors.shortDesc.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Détails, matière, conseils d'entretien…"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">{errors.description.message}</p>
          )}
        </div>

        <ImagesField name="images" />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white font-medium shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement…" : submitLabel}
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

function AddProductDialog({ open, setOpen, onCreated }) {
  const [internalOpen, setInternalOpen] = useState(open);
  useEffect(() => setInternalOpen(open), [open]);
  useEffect(() => setOpen && setOpen(internalOpen), [internalOpen]);

  // Pour guard de fermeture si dirty: on laisse le form gérer via callback
  const formRef = useRef(null);

  return (
    <Dialog.Root open={internalOpen} onOpenChange={(next) => {
        if (!next) {
          const ok = formRef.current?.canClose ? formRef.current.canClose() : true;
          if (!ok) { setInternalOpen(true); return; }
        }
        setInternalOpen(next);
      }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">Ajouter un produit</Dialog.Title>
          <div className="mt-4">
            <AddProductForm
              ref={formRef}
              onCancel={() => setInternalOpen(false)}
              onCreated={(p) => {
                onCreated?.(p);
                setInternalOpen(false);
              }}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const AddProductForm = React.forwardRef(function AddProductForm({ onCancel, onCreated }, ref) {
  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: { name: "", price: "", category: "", shortDesc: "", description: "", active: true, images: [] },
    mode: "onChange",
  });
  const { handleSubmit, formState, reset } = methods;
  const { isSubmitting, isDirty } = formState;

  // guard fermeture
  React.useImperativeHandle(ref, () => ({
    canClose: () => !isDirty || window.confirm("Modifications non sauvegardées. Fermer ?"),
  }));

  const submit = async (values) => {
    try {
      const { data } = await api.post("/products", values);
      toast.success("Produit ajouté avec succès");
      onCreated?.(data?.data || data); // compat avec structure {data}
      reset();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Échec de l'ajout";
      toast.error(msg);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(submit)} className="space-y-5">
        <ProductFormFields />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-xl border px-4 py-2 font-medium hover:bg-gray-50"
            onClick={() => {
              if (!isDirty || window.confirm("Annuler les modifications ?")) onCancel?.();
            }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Enregistrement…" : "Créer"}
          </button>
        </div>
      </form>
    </FormProvider>
  );
});

function ProductFormFields() {
  const { register, formState } = useFormContextSafe();
  const { errors } = formState;
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: T-shirt bleu"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Prix (€) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
            {...register("price")}
          />
          {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie *</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ex: T-shirts"
            {...register("category")}
          />
          {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input id="active" type="checkbox" {...register("active")} />
          <label htmlFor="active" className="text-sm text-gray-700">Actif (visible en boutique)</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description courte</label>
        <input
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Max 160 caractères"
          {...register("shortDesc")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={4}
          className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Détails, matière, conseils d'entretien…"
          {...register("description")}
        />
      </div>

      <ImagesField name="images" />
    </>
  );
}

function EditProductDialog({ product, onClose, onUpdated, onDeleted }) {
  const [open, setOpen] = useState(!!product);
  useEffect(() => setOpen(!!product), [product]);

  const methods = useForm({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {},
    mode: "onChange",
  });
  useEffect(() => {
    methods.reset(product || {});
  }, [product]);

  const { handleSubmit, formState, reset } = methods;
  const { isSubmitting, isDirty } = formState;

  const submit = async (values) => {
    try {
      const id = getId(product) ;
      const { data } = await api.patch(`/products/${id}`, values);
      toast.success("Produit modifié avec succès");
      onUpdated?.(data?.data || data);
      setOpen(false);
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Échec de la modification";
      toast.error(msg);
    }
  };

  const doDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce produit ?")) return;
    try {
      const id = getId(product);
      await api.delete(`/products/${id}`);
      toast.success("Produit supprimé");
      onDeleted?.(id);
      setOpen(false);
      onClose?.();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Échec de la suppression";
      toast.error(msg);
    }
  };

  if (!product) return null;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next && isDirty) {
          const ok = window.confirm("Modifications non sauvegardées. Fermer ?");
          if (!ok) return;
        }
        setOpen(next);
        if (!next) onClose?.();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">Éditer — {product?.name}</Dialog.Title>
          <div className="mt-4">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(submit)} className="space-y-5">
                <ProductFormFields />
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={doDelete}
                    className="rounded-xl bg-red-600 px-4 py-2 text-white font-semibold hover:bg-red-700"
                    title="Supprimer ce produit"
                  >
                    Supprimer
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="rounded-xl border px-4 py-2 font-medium hover:bg-gray-50"
                      onClick={() => {
                        if (!isDirty || window.confirm("Annuler les modifications ?")) onClose?.();
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Enregistrement…" : "Enregistrer"}
                    </button>
                  </div>
                </div>
              </form>
            </FormProvider>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function Page() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0, sortBy: "createdAt", order: "desc" });
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("recent"); // recent | price-asc | price-desc
  const [loading, setLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState(null); // produit en cours d'édition
  const [menuOpenFor, setMenuOpenFor] = useState(null); // id de la ligne avec menu ouvert

  const totalPages = useMemo(() => Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10))), [meta]);

  const knownCategories = useMemo(() => {
    const set = new Set();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const fetchProducts = useCallback(async (opts = {}) => {
    const page = opts.page ?? meta.page;
    let sortBy = "createdAt";
    let order = "desc";
    if (sort === "price-asc") { sortBy = "price"; order = "asc"; }
    if (sort === "price-desc") { sortBy = "price"; order = "desc"; }

    const params = { page, limit: meta.limit || 10, sortBy, order };
    if (category) params.category = category;

    setLoading(true);
    try {
      const { data } = await api.get("/products", { params });
      const list = data?.data || data?.items || data || [];
      const m = data?.meta || { page, limit: params.limit, total: list.length, sortBy, order };
      setProducts(list);
      setMeta(m);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur de chargement";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [meta.page, meta.limit, sort, category]);

  useEffect(() => { fetchProducts({ page: 1 }); }, [sort, category]);
  useEffect(() => { fetchProducts(); }, []);

  const prependProduct = (p) => {
    setProducts((cur) => [p, ...cur]);
    setMeta((m) => ({ ...m, total: (m.total || 0) + 1 }));
  };

  const replaceProduct = (p) => {
    const id = getId(p);
    setProducts((cur) => cur.map((x) => (getId(x) === id ? { ...x, ...p } : x)));
  };

  const removeProductById = (id) => {
    setProducts((cur) => cur.filter((x) => getId(x) !== id));
    setMeta((m) => ({ ...m, total: Math.max(0, (m.total || 0) - 1) }));
  };

  const nextPage = () => {
    if (meta.page < totalPages) {
      const next = meta.page + 1;
      setMeta((m) => ({ ...m, page: next }));
      fetchProducts({ page: next });
    }
  };
  const prevPage = () => {
    if (meta.page > 1) {
      const prev = meta.page - 1;
      setMeta((m) => ({ ...m, page: prev }));
      fetchProducts({ page: prev });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produits</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="rounded-xl bg-indigo-600 text-white font-semibold px-4 py-2 hover:bg-indigo-700 shadow"
        >
          + Ajouter
        </button>
      </div>

      {/* Filtres */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-gray-700">Catégorie</label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Toutes</option>
            {knownCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tri</label>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="recent">Plus récents</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix décroissant</option>
          </select>
        </div>
        <div className="text-right md:text-right">
          <button
            onClick={() => fetchProducts({ page: 1 })}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 hover:bg-gray-50"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Table liste */}
      <div className="mt-6 overflow-hidden rounded-2xl border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prix</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Catégorie</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && (
              <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Chargement…</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td className="px-4 py-6 text-gray-500" colSpan={4}>Aucun produit</td></tr>
            )}
            {products.map((p) => (
              <tr key={getId(p)} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{Number(p.price).toFixed(2)} €</td>
                <td className="px-4 py-3 text-sm text-gray-700">{p.category || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      className="rounded-full w-8 h-8 inline-flex items-center justify-center hover:bg-gray-200"
                      onClick={() => setMenuOpenFor(menuOpenFor === getId(p) ? null : getId(p))}
                      title="Actions"
                    >
                      ⋮
                    </button>
                    {menuOpenFor === getId(p) && (
                      <div className="absolute right-0 z-30 mt-2 w-40 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5">
                        <button
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => { setEditing(p); setMenuOpenFor(null); }}
                        >
                          Modifier
                        </button>
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            setMenuOpenFor(null);
                            if (!window.confirm("Supprimer ce produit ?")) return;
                            try {
                              await api.delete(`/products/${getId(p)}`);
                              toast.success("Produit supprimé");
                              removeProductById(getId(p));
                            } catch (e) {
                              const msg = e?.response?.data?.message || e.message || "Échec de la suppression";
                              toast.error(msg);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {meta.page} / {totalPages} — {meta.total} produit(s)
        </div>
        <div className="flex gap-2">
          <button
            onClick={prevPage}
            disabled={meta.page <= 1}
            className="rounded-xl border px-3 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            ← Précédent
          </button>
          <button
            onClick={nextPage}
            disabled={meta.page >= totalPages}
            className="rounded-xl border px-3 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Dialog d'ajout */}
      {addOpen && (
        <AddProductDialog
          open={addOpen}
          setOpen={setAddOpen}
          onCreated={prependProduct}
        />
      )}

      {/* Dialog d'édition */}
      {editing && (
        <EditProductDialog
          product={editing}
          onClose={() => setEditing(null)}
          onUpdated={(p) => replaceProduct(p)}
          onDeleted={(id) => removeProductById(id)}
        />
      )}
    </div>
  );
}
