import User from "../models/userModel.js";
import Vendor from "../models/vendorModel.js";
import Studio from "../models/studioModel.js";
import Category from "../models/categoryModel.js";
import Subcategory from "../models/subCategoryModel.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import cloudinary from "../util/cloudinary.js";
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
    console.log(vendor, "vendors");

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
    console.log(req.body, "server body");
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
    console.log(req.body, "server body");
    console.log("studioId:", studioId);
    console.log("status:", status);

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
  console.log("workingg");
  try {
    console.log(req.params);
    const { cat_id } = req.params;
    const category = await Category.findById(cat_id);
    res.status(200).json(category);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
//  export const editCategory = async (req,res)=>{
//   try {
//     const {_id} = req.params
//     const  category = await Category.findOneAndUpdate(_id,{$set:{}})

//   } catch (error) {
//     console.log(error.message)
//     res.status(500).json({message:'Internal Server error'})
//   }
//  }

export const addSubCategory = async (req, res) => {
  try {
    const {id,values,baseImage} = req.body.cat_id;
    const {name,description} = values
    console.log(id,values,name,description,baseImage,"_id,value,sname,description,baseImage")
    const image = await cloudinary.uploader.upload(baseImage,{folder:'sub_category_img'})
    const subCategory = new Subcategory({
      name: name,
      image:image.secure_url,
      description: description, 
      categoryId:id
    });
    await subCategory.save();  

    //update the category array with subcategory
   const parentCategory = await Category.findById({_id:id})
   parentCategory.subcategories.push(subCategory._id)
   await parentCategory.save()

    res.status(200).json({subCategory,parentCategory});
  } catch (error) {
    console.log(error.message);
  }
};
export const subcategory = async(req,res)=>{
  try {
    const {cat_id} = req.params;
    const subcategory = await Subcategory.find({categoryId:cat_id})
    res.status(200).json(subcategory)
  } catch (error) { 
    console.log(error.message)
    res.status(200).json({message:"Internal server error"})
  }
}