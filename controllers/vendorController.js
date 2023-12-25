import securePassword from "../util/securePassword.js";
import Vendor from '../models/vendorModel.js';
import vendorSendEmail from '../util/nodeMailer.js'
import Otp from '../models/otpModel.js'
import bycrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const vendorSignup = async (req,res)=>{
    let otpId;
    try {
        const {name,email,mobile,password} = req.body;
        console.log(req.body,'body')
        const hashedPassword = await securePassword(password)
        const emailExist = await Vendor.findOne({email:email})
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
            status:`Otp has sent to ${email}`,
            vendor:vendorData,
            otpId: otpId
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({status:"internal Server Error"})
    }
}
export const vendorEmailVerify = async(req,res)=>{
    try{
        const {otp,vendorId} = req.body;
        console.log(req.body)
        
        const otpData = await Otp.find({userId:vendorId})
        console.log(otpData,"otp data")
        const {expiresAt} = otpData[otpData.length - 1]
        const correctOtp = otpData[otpData.length - 1].otp;
        if(otpData && expiresAt < Date.now()){
            return res.status(401).json({message: "OTP has expired"})
        }
        if(correctOtp === otp){
            await Otp.deleteMany({userId: vendorId});
            await Vendor.updateOne(
                {_id: vendorId},
                {$set:{isVerified: true}}
            );
            res.status(200).json({
                status: true,
                message: 'Vendor registered successfully, You can login now',
            })
        }else{
            res.status(400).json({status: false,message: "Incorrect OTP"});
        } 
    }catch(error){
        console.log(error.message)
        res.status(500).json({status: "Internal Server Error"})
    }
}

export const vendorResendOtp = async (req,res)=>{
    try {
        const {vendorEmail} = req.body;
        const {_id, name,email} = await Vendor.findOne({email: vendorEmail})
        const otpId = vendorSendEmail(name,email,_id);
        if(otpId){
            res.status(200).json({
                message:`An OTP has been sent to ${email}`
            });
        }
    } catch (error) {
        console.log(error.message)
        res.status(500).json({status: "Internal Server Error"})
    }
}

export const vendorLoginVerify = async (req,res)=>{
    try {
        const {email,password} = req.body;
        const vendor = await Vendor.findOne({email:email})

        console.log(vendor,'vendor login')
        if(!vendor){
            return res.status(401).json({message: "Vendor not registered"})
        }
        if(vendor.isVerified){
            if(vendor.isBlocked === false){
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
                            role: "vendor"
                        },
                        process.env.VENDOR_JWT_KEY,
                        {
                            expiresIn: "1h",
                        }
                    )
                    res.status(200)
                       .json({vendor, token, message: `Welcome ${vendor.name}`})
                }else{
                    return res.status(403).json({message: "Incorrect Password"})
                }
            }else{
                return res.status(403).json({message: "Vendor is blocked by admin"})
            }
        }else{
            return res.status(401).json({status: "Email is not verified"})
        }
    } catch (error) {
        console.log(error.message)
    }
}