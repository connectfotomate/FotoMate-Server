import securePassword from "../util/securePassword.js";
import mailSender from "../util/nodeMailer.js";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import Otp from "../models/otpModel.js";
dotenv.config();
let otpId;

export const userSignup = async (req, res) => {
  try {
    
   
    const { name, email, mobile, password } = req.body;
    const hashedPassword = await securePassword(password);
    const emailExist = await User.findOne({ email: email });
    if (emailExist) {
      return res
        .status(490)
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
        message:`An OTP has been resent to ${email}.`,
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
      text: `http://localhost:5173/resetPassword/${oldUser._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).json({
          message: "Failed to send email for password reset.",
        });
      } else {
        console.log("Email sent:", info.response);
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
          res.status(200).json({user:userWithoutPassword,token,message:`Welcome ${user.name}`})
        }else{
            res.status(403).json({message:'Incorrect password'})
        }
      }else{
        res.status(403).json({message:'User is blocked by admin'})
      }
    }else{
        res.status(403).json({message:'Email is not verified'})
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getUserDetails = async(req,res)=>{
    try {
        const {id} = req.query;
        console.log(id,typeof(id))
        const userData = await User.findOne({_id:id})
        res.status(200).json({userData})
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message:'Internal server error'})
    }
}

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
        name: displayName.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4),
        email: email,
        password: hashedPassword,
        profileImage: photoURL,
        isEmailVerified:true
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.USER_JWT_KEY);
      const { password, ...userData } = newUser._doc;

      console.log(userData,'user')
      return res.status(200).json({ user: userData, token, message: 'User created successfully.' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
 