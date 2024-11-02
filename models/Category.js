// models/Category.js
import { model, Schema, models } from "mongoose";

const CategorySchema = new Schema({
  name: { type: String, required: true },
  // Remove properties field from the Category schema
  // properties: { type: Array, default: [] },
}, {
  timestamps: true,
});

export const Category = models.Category || model('Category', CategorySchema);
