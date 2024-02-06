import mongoose from "mongoose";
const adminSchema = mongoose.Schema({
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    walletHistory: [
      {
        amount: {
          type: Number,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        from: {
          type: String,
        },
      },
    ],
  });
  
  const admin = mongoose.model("Admin", adminSchema);
  module.exports = admin;