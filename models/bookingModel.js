import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    studioId: {
        type: mongoose.Types.ObjectId,
        ref: 'Studio',
        required: true,
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    packageId: {
        type: mongoose.Types.ObjectId,
        ref: 'PhotographyPackage',
        required: true,
    },
    eventDate: {
        type: Date,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    advanceAmount: {
        type: Number,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    isPaid: {
        type: Boolean,
        default: false,
        required: true,
    },
    workStatus: {
        type: String,
        default: 'pending',
        required: true
    },
    isCancelled: {
        type: Boolean,
        default: false,
        required: true,
    },
    cancelReason: {
        type: String, 
    }
},{timestamps:true});

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
