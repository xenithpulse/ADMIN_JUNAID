import mongoose, {model, Schema, models} from "mongoose";

const ProductSchema = new Schema({
  title: {type:String, required:true},
  description: String,
  price: {type: Number, required: true},
  discounted_percentage: {type: Number},
  images: [{type:String}],
  category: {type:mongoose.Types.ObjectId, ref:'Category'},
  properties: {type:Object},
  featured: {type:Boolean, default: false}
}, {
  timestamps: true,
});

export const Product = models.Product || model('Product', ProductSchema);