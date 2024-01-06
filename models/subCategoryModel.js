import mongoose from "mongoose";

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String, 
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
});

const Subcategory = mongoose.model('Subcategory', subcategorySchema);

module.exports = Subcategory;
