//ProductForm.jsx//
import { useFormContext } from "react-hook-form";

export default function (onSubmit, submitLabel, onDeleted) {
    const [ register, formState = {errors, isSubmiting}] = useFormContext()

    return(


        <form onSubmit={onSubmit} className="">
            
            {errors && (
                <p className=""> {errors} </p>
            )}
            <div className="">
                <label className="">Nom *</label>
                <input className="" placeholder="Produits"{...register("name", {required:true})} ></input>
            </div>
                <div className="">
                <label className="">Prix *</label>
                <input className="" placeholder="0.00"{...register("price", {required:true})} ></input>
            </div>
                <div className="">
                <label className="">Descritpion courte</label>
                <input className="" placeholder="...."{...register("shortDesc")} ></input>
            </div>
                <div className="">
                <label className="">Description</label>
                <textarea rows={4} className="" placeholder="Détails, matière, …" {...register("description")} />
            </div>
                <div className="">
                <label className="">Catégories</label>
                <input className="" placeholder="Alimentaires"{...register("Category")} ></input>
            </div>
            
            <ImagesFields field="Images"/>
            {onDeleted && (
                <button className="" onClick={onDeleted}>Supprimer le produit</button>
            )}
            <button className="" onClick={() => {history.back()}}> Annuler </button>
            <button className="" type="submit" disabled={isSubmiting}>{submitLabel}</button>
        </form>
    )
}