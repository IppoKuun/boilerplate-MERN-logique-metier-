import { queryBuilder } from "../utils/queryBuilder"
import {pagination, buildMeta} from "../utils/pagination";
import Product from "../models/product"
import buildSafePatch from "../utils/sanitize";


export default async function list(req, res){

  const {filter, sort, sortBy, order } = queryBuilder(req.query,{
    equals: new Set ([ "nom", "category", "slug" ]),
    ranges: new Set([ "price" ]),
    allowedSort: new Set ([ "price" ]),
  })

    const {page, limit, skip} = pagination(req.query, 
    {defaultLimit : 20, maxLimit : 100, defaultPage : 1})
    
    const {items, total} = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ])
  const meta = buildMeta({ page, limit, total, sortBy, order})

  return res.status(200).json(items, meta)
}

export default async function getProduct(req, res){
  const id = req.params.id
  const doc = await Product.findById(id)
  if (!doc) return res.status(404).json({message:"Produit non trouvé"})
  return res.status(200).json(doc)
}

export default async function postProduct(req, res){
  const newProduct = await Product.create(req.body)
    return res.status(201).json({message: "Porduit ajoutez avec succées"})
}

export default async function deleteProduct(req, res){
  const id = req.params.id
  const dltProduct = await Product.findByIdAndDelete(id)
  if (!dltProduct){ return res.status(404).json({message: "Produit introuvable"})}
  return res.status(200).json({message : "Produit supp avec succès"})
}

export default async function  updateProduct(req, res){
  const id = req.params.id
  const allowedPart = buildSafePatch(req.body, ["nom", "description", "price", "category", "slug",
    "shortDesc", "images", "isActive",]);
  const updProduct = await Product.findByIdAndUpdate(id, allowedPart, {new:true})
    if (!updProduct){ return res.status(404).json({message: "Produit introuvable"})}
  return res.status(200).json({updProduct})
}