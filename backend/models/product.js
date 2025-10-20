const mongoose = require('mongoose');
const slugify = require('slugify');               

const productSchema = new mongoose.Schema({
  nom: { required: true, type: String, trim: true, lowercase: true },
  description: { required: true, type: String },
  shortDesc: { required: true, type: String },
  price: { required: true, type: Number },
  category: { required: true, type: String, lowercase: true },
  images: { type: [String] },
  isActive: { type: Boolean, required: true },
  slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
}, { timestamps: true });

    productSchema.pre('validate', async function (next) {
    if (!this.slug && this.nom) {
        const base = slugify(this.nom, { lower: true, strict: true, locale: 'fr' });
        let candidate = base;
        let i = 2;

        const Model = this.constructor; 
        while (await Model.exists({ slug: candidate })) {
        candidate = `${base}-${i++}`; 
        }
        this.slug = candidate;
    }
    next();
    });


productSchema.index({ nom: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
