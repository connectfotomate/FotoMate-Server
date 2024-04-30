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
    const { cat_id, name, description, baseImage } = req.body;

    let imageUrl;
    if (baseImage) {
      const image = await cloudinary.uploader.upload(baseImage, {
        folder: "category_img",
      });
      imageUrl = image.secure_url;
    }
    let category = await Category.findById(cat_id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!category.image && !imageUrl) {
      imageUrl = null;
    }

    category = await Category.findByIdAndUpdate(
      { _id: cat_id }, 
      {
        $set: {
          name: name,
          description: description,
          image: imageUrl,
        },
      },
      { new: true }
    );

    res.status(201).json({ message: "Category Edited Successfully" });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
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


//  calculate start dates
const calculateStartDate = (today, yearDiff = 0, monthDiff = 0, dateDiff = 0) => {
  return new Date(today.getFullYear() - yearDiff, today.getMonth() - monthDiff, today.getDate() - dateDiff);
};



// generate report for a period
const generateReportForPeriod = async (period) => {
  const bookings = await Booking.find({
    createdAt: { $gte: period.start, $lt: period.end },
    isPaid: false,
    isCancelled: false
  });

  const users = await User.find({
    createdAt: { $gte: period.start, $lt: period.end }
  });

  const vendors = await Vendor.find({
    createdAt: { $gte: period.start, $lt: period.end }
  });

  const totalRevenue = bookings.reduce((acc, booking) => acc + booking.advanceAmount, 0);

  return {
    period: period.label,
    revenue: totalRevenue,
    newUsersCount: users.length,
    newVendorsCount: vendors.length,
  };
};

export const adminReport = async (req, res) => {
  try {
    const today = new Date();
   

    const periods = [
      { label: 'Today', start: calculateStartDate(today, 0, 0, 1), end: today },
      { label: 'Last Week', start: calculateStartDate(today, 0, 0, 7), end: today },
      { label: 'Last Month', start: calculateStartDate(today, 0, 1, 0), end: today },
      { label: 'Last Year', start: calculateStartDate(today, 1, 0, 0), end: today },
      { label: 'Total', start: new Date(0), end: today }
    ];
// Calculate total advance amount across all bookings
const totalAdvanceAmount = await Booking.aggregate([
  {
    $match: {
      isPaid: false,
      isCancelled: false
    }
  },
  {
    $group: {
      _id: null,
      totalAdvanceAmount: { $sum: "$advanceAmount" }
    }
  }
]);

  // Get the count of bookings for each status
  const statusCounts = await Booking.aggregate([
    {
      $group: {
        _id: "$workStatus",
        count: { $sum: 1 }
      }
    }
  ]);

  // Extract counts for pending, completed, and cancelled statuses
  let pendingCount = 0;
  let completedCount = 0;
  let cancelledCount = 0;
  statusCounts.forEach(status => {
    if (status._id === "pending") {
      pendingCount = status.count;
    } else if (status._id === "Completed") {
      completedCount = status.count;
    } else if (status._id === "cancelled") { 
      cancelledCount = status.count;
    }
  });

// Extract total advance amount from the result
const totalAdvance = totalAdvanceAmount.length > 0 ? totalAdvanceAmount[0].totalAdvanceAmount : 0;
    const report = await Promise.all(periods.map(generateReportForPeriod));

    res.status(200).json({report,totalAdvance,pendingCount,completedCount,cancelledCount});
  } catch (error) {
    console.error('Error generating admin report:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};





export const updateWorkStatus = async(req,res)=>{
  try {
    const {id} = req.body;
    const booking = await Booking.findById(id);
    booking.workStatus = 'Completed'
    booking.save() 
    res.status(201).json({message:'Work Stauts updated'})
  } catch (error) {
    console.log(error.message)
  }
}