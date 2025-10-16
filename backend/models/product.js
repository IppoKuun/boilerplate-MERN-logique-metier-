const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    nom: {
        required : true,
        type: String,
        trim: true,
        lowercase:true,
    },
    description : {
        required : true,
        type:String,
    },

    shortDesc : {
        required : true,
        type:String,
    },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },


    price : {
        type:Number,
        required:true
    },
    category: {
        type: String,
        enum: [
        "electronics",
        "fashion",
        "home",
        "beauty",
        "sports",
        "toys",
        "automotive",
        "books",
        "groceries",
        "health",
        "office",
        "garden",
        "music",
        "video_games"
        ], required: true
    },

    images: {
        type: [String],
    },
    
    isActive:{
        type:Boolean,
        required:true
    },

    updatedAt:{
        type:timestamps,
    },
    createdAt:{
        type:timestamps,
    }
}, {timestamps: true})

productSchema.index({nom : 1})
productSchema.index({price : 1})
productSchema.index({category : 1})

const Product = mongoose.model("Product", productSchema)