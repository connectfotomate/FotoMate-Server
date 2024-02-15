import securePassword from "../util/securePassword.js";
import mailSender from "../util/nodeMailer.js";
import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import Studio from "../models/studioModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Otp from "../models/otpModel.js";
import cloudinary from "../util/cloudinary.js";
import Category from "../models/categoryModel.js";
import PhotographyPackage from "../models/packageModel.js";
import Booking from "../models/bookingModel.js";
import Stripe from "stripe";
import Chat from "../models/chatModel.js";
dotenv.config();
let otpId;
const stripe = Stripe(process.env.STRIPE_API_KE);

export const userSignup = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await securePassword(password);
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      return res
        .status(400)
        .json({ message: "User already registered with this email" });
    }
    const user = new User({
      name: name,
      email: email,
      mobile: mobile,
      password: hashedPassword,
    });
    const userData = await user.save();
    otpId = mailSender(userData.name, userData.email, userData._id);
    res.status(201).json({
      message: `Otp has send to ${email}`,
      user: userData,
      otpId: otpId,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const emailOtpVerification = async (req, res) => {
  try {
    const { otp, userId } = req.body;
    const otpData = await Otp.find({ userId: userId });
    const { expiresAt } = otpData[otpData.length - 1];
    const correctOtp = otpData[otpData.length - 1].otp;
    if (otpData && expiresAt < Date.now()) {
      return res.status(401).json({ message: "Email otp has expired" });
    }
    if (correctOtp === otp) {
      await Otp.deleteMany({ userId: userId });
      await User.updateOne(
        { _id: userId },
        { $set: { isEmailVerified: true } }
      );
      res.status(200).json({
        status: true,
        message: "Registered successfully, You can login now",
      });
    } else {
      res.status(400).json({
        status: false,
        message: "Incorrect Otp",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { userEmail } = req.body;
    const { _id, name, email } = await User.findOne({ email: userEmail });
    const otpId = mailSender(name, email, _id);

    if (otpId) {
      res.status(200).json({
        message: `An OTP has been resent to ${email}.`,
      });
    }
  } catch (error) {
    console.log(error.message);
    return res
      .status(500)
      .json({ message: "Failed to send OTP. Please try again later." });
  }
};
export const forgotPassword = async (req, res) => {
  try {
    const { userEmail } = req.body;

    const secret = process.env.USER_JWT_KEY;
    const oldUser = await User.findOne({ email: userEmail });

    if (!oldUser) {
      return res.status(401).json({ message: "User is not registered" });
    }

    const token = jwt.sign({ id: oldUser._id }, secret, { expiresIn: "5m" });

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Forgot password",
      text: `https://fotomate.vercel.app/resetPassword/${oldUser._id}/${token}`,
      // text: `http:localhost:5173/resetPassword/${oldUser._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({
          message: "Failed to send email for password reset.",
        });
      } else {
        res.status(200).json({
          message: "Email sent successfully for password reset.",
        });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { id, token } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    try {
      const verify = jwt.verify(token, process.env.USER_JWT_KEY);
      if (verify) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(
          { _id: id },
          { $set: { password: hashedPassword } }
        );
        return res
          .status(200)
          .json({ message: "Successfully changed password" });
      }
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: "Something wrong with token" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(501).json({ message: "Internal server error" });
  }
};
export const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(401).json({ message: "User not registered" });
    }
    if (user.isEmailVerified) {
      if (user.isBlocked === false) {
        const correctPassword = await bcrypt.compare(password, user.password);
        if (correctPassword) {
          const token = jwt.sign(
            {
              name: user.name,
              email: user.email,
              id: user._id,
              role: "user",
            },
            process.env.USER_JWT_KEY,
            { expiresIn: "1h" }
          );
          const { password, ...userWithoutPassword } = user.toObject();
          res.status(200).json({
            user: userWithoutPassword,
            token,
            message: `Welcome ${user.name}`,
          });
        } else {
          res.status(403).json({ message: "Incorrect password" });
        }
      } else {
        res.status(403).json({ message: "User is blocked by admin" });
      }
    } else {
      res.status(403).json({ message: "Email is not verified" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userData = await User.findOne({ _id: id });
    res.status(200).json({ userData });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const google = async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.USER_JWT_KEY);
      const { password, ...userData } = user._doc;

      res.status(200).json({ user: userData, token });
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await securePassword(generatedPassword);

      const newUser = new User({
        name:
          displayName.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: email,
        password: hashedPassword,
        profileImage: photoURL,
        isEmailVerified: true,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.USER_JWT_KEY);
      const { password, ...userData } = newUser._doc;

      return res
        .status(200)
        .json({ user: userData, token, message: "User created successfully." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const vendorList = async (req, res) => {
  try {
    const vendor = await Vendor.aggregate([
      {
        $lookup: {
          from: "studios", // The name of the Studio collection
          localField: "_id",
          foreignField: "vendorId",
          as: "studioInfo",
        },
      },
      {
        $unwind: "$studioInfo",
      },
      {
        $project: {
          _id: 1,
          name: 1,
          mobile: 1,
          email: 1,
          isBlocked: 1,
          isVerified: 1,
          studioInfo: {
            _id: "$studioInfo._id",
            studioName: "$studioInfo.studioName",
            city: "$studioInfo.cities",
            description: "$studioInfo.description",
            coverImage: "$studioInfo.coverImage",
            galleryImages: "$studioInfo.galleryImages",
          },
        },
      },
    ]).exec();
    return res.status(200).json(vendor);
  } catch (error) {
    console.log(error.message);
  }
};

//  export const studioList = async (req, res) => {
//   try {
//     const { catId } = req.query;
//     let query = {};

//     if (catId && catId.length > 0) {
//       const catIds = catId.split(',');
//       query = { _id: { $in: catIds } };
//     }

//     const studios = await Studio.find(query);

//     if (studios.length === 0) {
//       return res.status(404).json([]);
//     }

//     return res.status(200).json(studios);
//   } catch (error) {
//     console.error(error.message);
//     return res.status(500).json({ message: 'Internal Server Error' });
//   }
// };

export const studioList = async (req, res) => {
  try {
    let { catId, page = 1, pageSize = 4 } = req.query;
    page = Number(page);
    pageSize = Number(pageSize);

    let query = {};
    if (catId && catId.length > 0) {
      const catIds = catId.split(",");
      query = { _id: { $in: catIds } };
    }
    const totalCount = await Studio.countDocuments(query);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (page > totalPages) {
      return res.status(404).json({ message: "Page not found" });
    }
    const skip = (page - 1) * pageSize;
    const studios = await Studio.find(query).skip(skip).limit(pageSize);
    studios.forEach(studio => {
      studio.galleryImages = studio.galleryImages.map(imageUrl => {
        // Replace the file extension with .webp
        return imageUrl.replace(/\.jpg$/, ".webp");
      });
    });
    const nextPage = page < totalPages ? page + 1 : null;

    if (studios.length === 0) {
      return res.status(404).json([]);
    }

    return res.status(200).json({
      studios,
      page,
      totalPages,
      nextPage,
    });
  } catch (error) {
    console.error(error.message); // Log error message
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const singleStudio = async (req, res) => {
  try {
    const { id } = req.params;
    const studio = await Studio.findById({ _id: id })
      .populate({
        path: 'review.postedBy',
        model: User,
        select: 'name profileImage' 
      });
    return res.status(200).json(studio);
  } catch (error) {
    console.log(error.message);
  }
};



export const updateProfileImage = async (req, res) => {
  try {
    const { _id, img } = req.body;
    // Validate request body
    if (!img || !_id) {
      return res.status(400).json({ message: "Invalid request body" });
    }

    const photoResult = await cloudinary.uploader.upload(img, {
      folder: "userphoto",
    });
    const user = await User.findByIdAndUpdate(
      _id,
      { $set: { profileImage: photoResult.secure_url } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res
      .status(200)
      .json({ message: "Profile picture updated successfully", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subcategories").exec();
    res.status(200).json(categories);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }     
};

export const filterCategories = async (req, res) => {
  try {
    const { name, searchTerm } = req.query;

    let query = {};

    if (name && name !== "All categories") {
      // If category is selected, use $and
      query = {
        $and: [
          { categories: name },
          {
            $or: [
              { studioName: { $regex: searchTerm, $options: "i" } },
              { city: { $in: [searchTerm] } },
            ],
          },
        ],
      };
    } else { 
      // If no category is selected or 'All categories' is selected, fetch all studios
      query = {
        $or: [
          { studioName: { $regex: searchTerm, $options: "i" } },
          { city: { $regex: searchTerm, $options: "i" } },
        ],
      };  
    }  
    const studio = await Studio.find(query);

    res.json(studio);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPackages = async (req, res) => {
  try {
    const { id } = req.query;
    const packages = await PhotographyPackage.find({ studioId: id });
    res.status(200).json(packages);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const bookPackage = async (req, res) => {
  try {
    const { date, place, packageId, userId } = req.body;
    const packageData = await PhotographyPackage.findById(packageId);

    // Calculate total amount
    const totalAmount = packageData.services.reduce(
      (total, service) => total + service.price,
      0
    );

    // Calculate advance amount (20% of total amount)
    const advanceAmount = totalAmount * 0.2;

    // Create a new booking
    const booking = new Booking({
      vendorId: packageData.vendorId,
      studioId: packageData.studioId,
      packageId: packageId,
      userId: userId,
      eventDate: date,
      location: place,
      category: packageData.category,
      advanceAmount: advanceAmount,
      totalAmount: totalAmount,
    });

    // Saving after payment the booking to the database

    res.status(200).json({ packageData, booking });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBooking = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId)
    const bookingData = await Booking.find({ userId: userId }).populate({
      path: "packageId",
      model: "PhotographyPackage",
    });
    res.status(200).json({bookingData,user});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};
export const getCheckoutPackage = async (req, res) => {
  try {
    const { packageId } = req.query;
    const packageData = await PhotographyPackage.findById(packageId);
    res.status(200).json(packageData);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export const payment = async (req, res) => {
  try {
    const { booking } = req.body;
    const {vendorId,userId,studioId} = booking
    // console.log(req.body,'body')
    const advance = booking.advanceAmount;
    const bookingInstance = new Booking(booking);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Amount",
            },
            unit_amount: advance * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `https://fotomate.vercel.app/success?studioId=${studioId}`,
      cancel_url: `https://fotomate.vercel.app/cancel`,
      // success_url: `http://localhost:5173/success?studioId=${studioId}`,
      // cancel_url: `http://localhost:5173/cancel`,
    });

    //  Creating chat after payment

    const chatExist = await Chat.findOne({
      user: userId,
      studio: vendorId,
    });

    if (!chatExist) {
      const newChat = new Chat({
        user: userId,
        studio: vendorId,
        messages: [],
      });

      await newChat.save();
    }

    // Saving booking

    const savedBooking = await bookingInstance.save();

    res.json({ id: session.id, savedBooking });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ error: "An error occurred while creating the session." });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    console.log("working");
    const { reason, bookingId } = req.body;
    console.log(req.body);
    const booking = await Booking.findById(bookingId);
    console.log(booking, "booking");
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Refund the amount to user's wallet 
    const user = await User.findById(booking.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.wallet += booking.advanceAmount;
    await user.save();

    // Update booking status
    booking.isCancelled = true;
    booking.cancelReason = reason;
    booking.workStatus = "cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "An error occurred during cancelling booking" });
  }
};

export const postReview = async (req, res) => {
  try {
    console.log(req.body,'body')
    const { review, rating, userId, studioId } = req.body;
    
    console.log(typeof(rating),'rating')
    // Find the studio by id
    const studio = await Studio.findById(studioId);
    console.log(studio,'studio')
    if (!studio) {
      return res.status(404).json({ error: "Studio not found" });  
    }

    // Check if a review by this user already exists
    const existingReviewIndex = studio.review.findIndex(r => r.postedBy.toString() === userId);

    if (existingReviewIndex !== -1) {
      // Update the existing review
      studio.review[existingReviewIndex].star =(rating);
      studio.review[existingReviewIndex].userReview = review;
      studio.review[existingReviewIndex].postedDate = new Date();
    } else {
      // Create a new review
      const newReview = {
        star: (rating),
        userReview: review,
        postedBy: userId,
        postedDate: new Date(),
      };

      // Add the review to the studio's reviews
      studio.review.push(newReview);
    }

    // Save the studio with the new or updated review
    let totalRating = 0;
    for(let i = 0; i < studio.review.length; i++) {
      totalRating += studio.review[i].star;
    }
    studio.totalRating = totalRating / studio.review.length;

    // Save the studio with the new or updated review
    const updatedStudio = await studio.save();

    res.json({ message: "Review posted successfully", updatedStudio });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "An error occurred while posting the review." });
  }
};

