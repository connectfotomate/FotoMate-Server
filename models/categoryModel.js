import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
  ],
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
