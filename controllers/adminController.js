import User from '../models/userModel.js'
import Vendor from '../models/vendorModel.js'
import dotenv from "dotenv"
import  jwt  from 'jsonwebtoken';
dotenv.config()


export const adminLogin = async (req, res) => {
    try {
       
        const adminEmail = process.env.ADMIN_EMAIL;
        const adminPassword = process.env.ADMIN_PASSWORD;
       
        const userName = 'Admin';

        const { email, password } = req.body;
      
           
        if (adminEmail === email) {
            if (adminPassword === password) {
                const token = jwt.sign(
                    {
                        name: userName,
                        email: adminEmail,
                        role: 'admin',
                    },
                    process.env.USER_JWT_KEY,
                    { expiresIn: '1h' } 
                );

                
                res.status(200).json({ message: `Welcome ${userName}`, token, userName });
                

            } else {
                res.status(401).json({ message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const userList = async (req,res)=>{
 try {
    const users = await User.find()
    res.status(200).json(users);
      
 } catch (error) {
    console.log(error.message);
 }
}

export const vendorList = async(req,res)=>{
    try {
        const vendors = await Vendor.find()
        
        res.status(200).json(vendors);  
       
    } catch (error) {
        console.log(error.message)
    }
}
export const blockUser = async (req,res)=>{
    try {
        const {userId,status} = req.body;
        
        await User.findByIdAndUpdate(
            {_id:userId},{$set:{isBlocked: !status}}
        );
        res.status(200).json({message:'updated'})
        
    } catch (error) {
        console.log(error) 
        res.status(500).json({status:"internal server error"})
    }
}
export const blockVendor = async (req,res)=>{
    try {
        const {vendorId,status} = req.body;
        console.log(req.body,'server body')
        await Vendor.findByIdAndUpdate(
            vendorId,
            {$set: {isBlocked: !status}},
            {new: true} 
          );
          
          
        res.status(200).json({message:'updated'})
        
    } catch (error) {
        console.log(error) 
        res.status(500).json({status:"internal server error"})
    }
}
