import mongoose from 'mongoose';
import slugify from 'slugify';             


const imageSchema = new mongoose.Schema({
  public_id: { type: String },
  url:       { type: String },
  alt:       { type: String, default: "" },
});

const productSchema = new mongoose.Schema({
  name: { required: true, type: String, trim: true },
  description: { required: true, type: String },
  shortDesc: { required: true, type: String },
  price: { required: true, type: Number },
  category: { required: true, type: String, lowercase: true },
    images:     { type: [imageSchema], default: [] }, // 👈 ici le champ images
  isActive: { type: Boolean, required: true },
  slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
}, { timestamps: true });

    productSchema.pre('validate', async function (next) {
    if (!this.slug && this.name) {
        const base = slugify(this.name, { lower: true, strict: true, locale: 'fr' });
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
productSchema.index({ name: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });

export default mongoose.model('Product', productSchema);
