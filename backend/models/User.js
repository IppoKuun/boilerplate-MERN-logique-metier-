import mongoose from "mongoose";
import { hashPassword, verifyPassword } from "../hash";

// On créer notre schema//
const { Schema } = mongoose

const userSchema = new Schema({
    username: {
        type: String,
        required:true,
        index:true,
        unique:true,
        trim:true,
        lowercase:true,
    },

    passwordHash:{
        type:String,
        required:true,
        select:false,
    },

    role:{
        type:String,
        required:true,
        enum:["owner", "admin", "viewer"], default:"viewer",
        index:true
    },

    displayName:{
        type:String,
        default:"",
        trim:true
    },

    status:{
        enum:["active", "suspendu"],
        default:"active"
    },
    lastLoginAt:{type:Date, default:null },

    createdAt:{type: String.ObjectID}
}, {
    timestamps:true,
    versionKey:false,
    toJSON:{
        transform: function(doc, ret){
            delete ret.passwordHash
            return ret
        }
    }
})

//JSP SI UTILE MTN OU PAS A VOIR AVEC COMMENT ON CREEER NV UTILISATEUR ETC//

userSchema.method.setPassword = async function (plain){
    this.passwordHash = await hashPassword(plain)
}

//Renvoie ce que l'user as tapé si le plain et hash bien la meme chose.//
userSchema.method.checkPassword = async function (plain){
    if(!this.passwordHash)
        throw error ("IL NYA PAS DE MDP HASHE ")
    return verifyPassword(plain, this.passwordHash)
}

//ça sera pour retrouver l'username + son MDP facilement//
userSchema.statics.FindByUsernameSecret = async function(username){
    return this.findOne({ username }).select("+passwordHash")
}

userSchema.index({ username: 1 }, { unique: true });   // empêche doublons
userSchema.index({ role: 1, status: 1 });     

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
