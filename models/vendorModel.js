import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    studio:
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Studio",
        },
      
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
