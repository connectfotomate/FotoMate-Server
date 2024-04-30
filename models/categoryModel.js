import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  image:{
    type:String,
  },
  description: {
    type: String,
  },
  unlist:{ 
    type:Boolean,
    default:false
  },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Subcategory',
    },
  ],
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
