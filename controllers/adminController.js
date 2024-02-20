import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import Studio from "../models/studioModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subCategoryModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cloudinary from "../util/cloudinary.js";
import Booking from "../models/bookingModel.js";
dotenv.config();

export const adminLogin = async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL; 
    const adminPassword = process.env.ADMIN_PASSWORD;

    const userName = "Admin";

    const { email, password } = req.body;

    if (adminEmail === email) {
      if (adminPassword === password) {
        const token = jwt.sign(
          {
            name: userName,
            email: adminEmail,
            role: "admin",
          },
          process.env.USER_JWT_KEY,
          { expiresIn: "1h" }
        );

        res
          .status(200)
          .json({ message: `Welcome ${userName}`, token, userName });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const userList = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error.message);
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
          password: 1,
          createdAt: 1,
          updatedAt: 1,
          studioInfo: {
            _id: "$studioInfo._id",
            studioName: "$studioInfo.studioName",
            city: "$studioInfo.city",
            isBlocked: "$studioInfo.isBlocked",
            isVerified: "$studioInfo.isVerified",
            description: "$studioInfo.description",
            coverImage: "$studioInfo.coverImage",
            galleryImages: "$studioInfo.galleryImages",
          },
        },
      },
    ]).exec();
    res.status(200).json(vendor);
  } catch (error) {
    console.log(error.message);
  }
};
export const blockUser = async (req, res) => {
  try {
    const { userId, status } = req.body;

    await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { isBlocked: !status } }
    );
    res.status(200).json({ message: "updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "internal server error" });
  }
};
export const blockVendor = async (req, res) => {
  try {
    const { vendorId, status } = req.body;
    await Vendor.findByIdAndUpdate(
      vendorId,
      { $set: { isBlocked: !status } },
      { new: true }
    );

    res.status(200).json({ message: "updated" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "internal server error" });
  }
};
export const blockStudio = async (req, res) => {
  try {
    const { studioId, status } = req.body;
    // Ensure status is a boolean
    if (typeof status !== "boolean") {
      console.error("Invalid status type:", typeof status);
      return res.status(400).json({ message: "Invalid status type" });
    }

    await Studio.findOneAndUpdate(
      { _id: studioId },
      { $set: { isBlocked: !status } },
      { new: true }
    );

    res.status(201).json({ message: "updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "this category already exist" });
    }
    const category = new Category({ name: name, description: description });
    const categoryData = await category.save();
    res.status(201).json({ category: categoryData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const categoryList = async (req, res) => {
  try {
    const categroy = await Category.find();
    res.status(200).json(categroy);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const singleCategory = async (req, res) => {
  try {
    const { cat_id } = req.params;
    const category = await Category.findById(cat_id);
    res.status(200).json(category);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const editCategory = async (req, res) => {
  try {
    const { cat_id, name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      { _id: cat_id },
      {
        $set: {
          name: name,
          description: description,
        },
      },
      { new: true }
    );
    res.status(201).json({ message: "Category Edited Successfully" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
      // Handle duplicate key error for the 'name' field
      return res.status(400).json({ message: "Category name already exists" });
    }
    console.log(error.message);
    res.status(500).json({ message: "Internal Server error" });
  }
};

export const addSubCategory = async (req, res) => {
  try {
    const { id, values, baseImage } = req.body.cat_id;
    const { name, description } = values;
    const image = await cloudinary.uploader.upload(baseImage, {
      folder: "sub_category_img",
    });
    const subCategory = new Subcategory({
      name: name,
      image: image.secure_url,
      description: description,
      categoryId: id,
    });
    await subCategory.save();

    //update the category array with subcategory
    const parentCategory = await Category.findById({ _id: id });
    parentCategory.subcategories.push(subCategory._id);
    await parentCategory.save();

    res.status(200).json({ subCategory, parentCategory });
  } catch (error) {
    console.log(error.message);
  }
};
export const subcategory = async (req, res) => {
  try {
    const { cat_id } = req.params;
    const subcategory = await Subcategory.find({ categoryId: cat_id });
    res.status(200).json(subcategory);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const unlistCategory = async (req, res) => {
  try {
    const { _id, status } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      { _id },
      { $set: { unlist: !status } },
      { new: true }
    );
    if (updatedCategory) {
      res
        .status(200)
        .json({
          message: "Category updated successfully",
          category: updatedCategory,
        });
    } else {
      res.status(404).json({ message: "Category not found" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBookingList = async (req, res) => {
  try {
    const bookingList = await Booking.find()
      .populate({
        path: "packageId",
        model: "PhotographyPackage",
      })
      .populate({
        path: "studioId",
        model: "Studio",
      })
      .populate({
        path: "userId",
        model: "User",
      });
    res
      .status(200)
      .json({ message: "Booking list fetched successfully", bookingList });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const cancelBooking = async (req, res) => {
  try {
    const { reason, bookingId } = req.body;
    console.log(req.body);
    const booking = await Booking.findById(bookingId);
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


export const adminReport = async (req, res) => {
  try {
   
    const today = new Date();
    const lastWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const lastYearStart = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const nextWeekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // Start from tomorrow
    const nextWeekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 8); // End after 7 days (inclusive)

    const periods = [
      { label: 'Today', start: today, end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) },
      { label: 'Last Week', start: lastWeekStart, end: today },
      { label: 'Last Month', start: lastMonthStart, end: today },
      { label: 'Last Year', start: lastYearStart, end: today },
      { label: 'Next Week', start: nextWeekStart, end: nextWeekEnd },
      { label: 'Total', start: new Date(0), end: today } 
    ];

    
    // Query for bookings in the next week
    const nextWeekBookings = await Booking.find({
      eventDate: { $gte: nextWeekStart, $lt: nextWeekEnd },
      isPaid: false, // Assuming you want to include only paid bookings
      isCancelled: false
    });

    const report = await Promise.all(periods.map(async period => {
      let bookings;
      if (period.label === 'Next Week') {
        bookings = await Booking.find({
          eventDate: { $gte: period.start, $lt: period.end },
          isPaid: true,
          isCancelled: false
        });
      } else {
        bookings = await Booking.find({
          eventDate: { $gte: period.start, $lt: period.end },
          isPaid: false,
          isCancelled: false
        });
      }

      const users = await User.find({
        createdAt: { $gte: period.start, $lt: period.end }
      });

      const vendors = await Vendor.find({
        createdAt: { $gte: period.start, $lt: period.end }
      });

      const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalAmount, 0);

      return {
        period: period.label,
        revenue: totalRevenue,
        newUsersCount: users.length,
        newVendorsCount: vendors.length,
      };
    }));

        nextWeekBookings
    res.status(200).json({report,nextWeekBookings});
  } catch (error) {
    console.error('Error generating admin report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



