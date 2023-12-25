import mongoose from 'mongoose';

const otpVendorSchema = new mongoose.Schema({
    vendorId: mongoose.Types.ObjectId,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
});

export default mongoose.model('vendorOtp', otpVendorSchema);
