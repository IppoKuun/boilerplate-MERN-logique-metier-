import { queryBuilder } from "../utils/queryBuilder"
import {pagination, buildMeta} from "../utils/pagination";
import Product from "../models/product"
import buildSafePatch from "../utils/sanitize";
import audit from "../utils/audit"


export default async function list(req, res){

  const {filter, sortBy, order } = queryBuilder(req.query,{
    equals: new Set ([ "nom", "category", "slug" ]),
    ranges: new Set([ "price" ]),
    allowedSort: new Set (["price"]),
  })

    const {page, limit, skip} = pagination(req.query, 
    {defaultLimit : 20, maxLimit : 100, defaultPage : 1})
    
    const {items, total} = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter)
    ])
  const meta = buildMeta({ page, limit, total, sortBy, order})
  return res.status(200).json({items, meta})
}

async function getProduct(req, res){
  const id = req.params.id
  const doc = await Product.findById(id)
  if (!doc) return res.status(404).json({message:"Produit non trouvé"})
  return res.status(200).json(doc)
}


  async function postProduct(req, res){
    const newProduct = await Product.create(req.body)
    
    if (!newProduct) {
      return res.status(400).json({ message: "Création échouée" });
    }
        await audit(req, {
          event : "product.create",
          target :{
            type : "produit",
            id: String(newProduct._id),
            slug: newProduct.slug,
          } 
        })
      return res.status(201).json({message: "Produit ajoutez avec succées"})
    }
  

async function deleteProduct(req, res){
  const id = req.params.id
  const dltProduct = await Product.findByIdAndDelete(id)
  if (!dltProduct){ return res.status(404).json({message: "Produit introuvable"})}
          await audit(req, {
          event : "product.deleted",
          target :{
            type : "produit",
            id: String(dltProduct._id),
            slug: dltProduct.slug,
          }})
  return res.status(200).json({message : "Produit supp avec succès"})
}


  async function  updateProduct(req, res){
  const id = req.params.id
  const allowedPart = buildSafePatch(req.body, ["nom", "description", "price", "category", "slug",
    "shortDesc", "images", "isActive",]);
  const updProduct = await Product.findByIdAndUpdate(id, allowedPart, {new:true})
    if (!updProduct){ return res.status(404).json({message: "Produit introuvable"})}
     await audit(req, {
      event: "product.update",
      target:{
        type: "produit",
        id: String(updProduct._id),
        slug: updProduct.slug
      }
     })
  return res.status(200).json({updProduct})
}

async function getProductBySlug(req, res) {
  const doc = await Product.findOne({ slug: req.params.slug });
  if (!doc) return res.status(404).json({ message: "Produit non trouvé" });
  return res.status(200).json(doc);
}

export {
  updateProduct,
  deleteProduct,
  postProduct,
  getProduct,
  list,
  getProductBySlug
}