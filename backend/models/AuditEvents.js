import mongoose from "mongoose"

const { Schema } = mongoose

const targetSchema = new Schema(
  { type: String, slug: String, id: String },
  { _id: false }
);
const AuditEventSchema = new Schema({
    ts : {type: Date, default : () => Date.now(), index:true,},
    event : { type: String, required: true, index:true},
    target : targetSchema,
    actor: { 
        user:String, 
        ip:String, 
        role:String, 
        id:String, 
        ua : String
    }, 
    diff:  Schema.Types.Mixed,
    correlationId: String,
}, {versionKey : false} )

AuditEventSchema.index({"actor.user" : 1, ts:-1})
AuditEventSchema.index({"target.slug" : 1, ts:-1})

export default mongoose.model("AuditEvent", AuditEventSchema );
