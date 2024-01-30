import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  serviceName: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
});

const photographyPackageSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Types.ObjectId,
    ref: "Vendor", // Reference to the Vendor model
    required: true,
  },
  studioId: {
    type: mongoose.Types.ObjectId,
    ref: "Studio", // Reference to the Studio model
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  services: [serviceSchema],
  additionalServices: [serviceSchema],
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
});

const PhotographyPackage = mongoose.model(
  "PhotographyPackage",
  photographyPackageSchema
);

export default PhotographyPackage;
