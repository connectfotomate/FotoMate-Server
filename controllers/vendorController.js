import securePassword from "../util/securePassword.js";
import Vendor from "../models/vendorModel.js";
import Studio from "../models/studioModel.js";
import vendorSendEmail from "../util/nodeMailer.js";
import Otp from "../models/otpModel.js";
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cloudinary from "../util/cloudinary.js";
import { Buffer } from "buffer";

export const vendorSignup = async (req, res) => {
  let otpId;
  try {
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await securePassword(password);
    const emailExist = await Vendor.findOne({ email: email });
    if (emailExist) {
      return res
        .status(490)
        .json({ message: "Vendor already registered with this email" });
    }
    const vendor = new Vendor({
      name: name,
      email: email,
      mobile: mobile,
      password: hashedPassword,
      isVerified: false,
      isBlocked: false,
    });

    const vendorData = await vendor.save();
    otpId = await vendorSendEmail(
      vendorData.name,
      vendorData.email,
      vendorData._id
    );
    res.status(201).json({
      status: `Otp has sent to ${email}`,
      vendor: vendorData,
      otpId: otpId,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "internal Server Error" });
  }
};
export const vendorEmailVerify = async (req, res) => {
  try {
    const { otp, vendorId } = req.body;

    const otpData = await Otp.find({ userId: vendorId });
    const { expiresAt } = otpData[otpData.length - 1];
    const correctOtp = otpData[otpData.length - 1].otp;
    if (otpData && expiresAt < Date.now()) {
      return res.status(401).json({ message: "OTP has expired" });
    }
    if (correctOtp === otp) {
      await Otp.deleteMany({ userId: vendorId });
      await Vendor.updateOne({ _id: vendorId }, { $set: { isVerified: true } });
      res.status(200).json({
        status: true,
        message: "Vendor registered successfully, You can login now",
      });
    } else {
      res.status(400).json({ status: false, message: "Incorrect OTP" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const vendorResendOtp = async (req, res) => {
  try {
    const { vendorEmail } = req.body;
    const { _id, name, email } = await Vendor.findOne({ email: vendorEmail });
    const otpId = vendorSendEmail(name, email, _id);
    if (otpId) {
      res.status(200).json({
        message: `An OTP has been sent to ${email}`,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const vendorLoginVerify = async (req, res) => {
  try {
    const { email, password } = req.body;
    const vendor = await Vendor.findOne({ email: email });
    const studio = await Studio.findOne({vendorId:vendor._id})
    console.log(studio,'studiooooooooooooo')  

    if (!vendor) {
      return res.status(401).json({ message: "Vendor not registered" });
    }
    if (vendor.isVerified) {
      if (vendor.isBlocked === false) {
        const correctPassword = await bycrypt.compare(
          password,
          vendor.password
        );
        if (correctPassword) {
          const token = jwt.sign(
            {
              name: vendor.name,
              email: vendor.email,
              id: vendor._id,
              role: "vendor",
            },
            process.env.VENDOR_JWT_KEY,
            {
              expiresIn: "1h",
            }
          );
          const { password, ...vendorWithoutPassword } = vendor.toObject();
          res
            .status(200)
            .json({ vendor:vendorWithoutPassword,studio, token, message: `Welcome ${vendor.name}` });
        } else {
          return res.status(403).json({ message: "Incorrect Password" });
        }
      } else {
        return res.status(403).json({ message: "Vendor is blocked by admin" });
      }
    } else {
      return res.status(401).json({ status: "Email is not verified" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

export const createStudio = async (req, res) => {
  try {
    let {
      studioName,
      location,
      galleryImages,
      coverImage,
      description,
      vendorId,
    } = req.body;
    
    const uploadGalleryImages = await galleryImages.map((image) => {
      return cloudinary.uploader.upload(image, {
        folder: "GalleryImages",
      });
    });

    const uploadedGalleryImages = await Promise.all(uploadGalleryImages);
    let galleryImage = uploadedGalleryImages.map((image) => image.secure_url);
     console.log();
    await Studio.create({
      studioName,
      vendorId,
      description,
      galleryImages: galleryImage,
      coverImage,
      city: location,
    });

    res.status(201).json({ message: "Studio added successfully" });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const vendorStudio = async (req, res) => {
    try {
      const { vendorId } = req.params;
      console.log('Received vendorId:', vendorId);
      const studio = await Studio.findOne({ vendorId: vendorId });
      console.log(studio,'studiooooooooooooooooo')
      if (!studio) {
        return res.status(404).json({ error: 'Studio not found' });
      }
  
      console.log('Found studio:', studio);
      res.status(200).json({ studio });
    } catch (error) {   
      console.error(error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  