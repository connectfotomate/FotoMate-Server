import mongoose from "mongoose";

const studioSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Types.ObjectId,
    ref: "Vendor",
    required: true, 
  },
  studioName: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  description:{
    type:String,
    
  },
  coverImage: {
    type: String,
    required: true,
  },
  galleryImages: [{
    type: String,
    required: true,
}
  ],
 
});

const Studio = mongoose.model("Studio", studioSchema);

export default Studio;
