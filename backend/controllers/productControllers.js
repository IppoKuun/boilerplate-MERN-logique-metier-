import { queryBuilder } from "../utils/queryBuilder.js"
import {pagination, buildMeta} from "../utils/pagination.js";
import Product from "../models/product.js"
import buildSafePatch from "../utils/sanitize.js";
import audit from "../utils/audit.js"


async function list(req, res){

  const {filter, sortBy, order } = queryBuilder(req.query,{
    equals: new Set ([ "name", "category", "slug" ]),
    ranges: new Set([ "price" ]),
    allowedSort: new Set (["price"]),
  })

    const {page, limit, skip} = pagination(req.query, 
    {defaultLimit : 20, maxLimit : 100, defaultPage : 1})
    
    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortBy).skip(skip).limit(limit).lean(),
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
      return res.status(400).json({ message: "Création échouée"});
    }
        await audit(req, {
          event : "product.create",
          target :{
            type : "produit",
            id: String(newProduct._id),
            slug: newProduct.slug,
          } 
        })

          const productPayload = typeof newProduct.toObject === "function"
      ? newProduct.toObject()
      : newProduct;
      return res.status(201).json({message: "Produit ajoutez avec succées", product: productPayload})
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
  const allowedPart = buildSafePatch(req.body, ["name", "description", "price", "category", "slug",
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

export default {
  updateProduct,
  deleteProduct,
  postProduct,
  getProduct,
  list,
  getProductBySlug
}