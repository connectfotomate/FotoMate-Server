import Vendor from "../models/vendorModel.js";
import Studio from '../models/studioModel.js'
import User from "../models/userModel.js"; 
import Chat from "../models/chatModel.js"; 

export const vendorData = async (req,res)=>{ 
    try {
        const {id} = req.params;
        const studio = await Studio.findOne({ vendorId:id })
        res.status(200).json(studio) 
    } catch (error) {  
        console.log(error.message)
        res.status(500).json({ message: error.message })
    }
}

export const userData = async (req,res) =>{
    try {
        const {id} = req.params;
        const user = await User.find({_id:id})

        res.status(200).json(user) 
    } catch (error) { 
        console.log(error.message)
        res.status(500).json({ message: error.message })
    }
}

export const findChatByUserAndStudio = async(req,res)=> {
    try {
      const {id, vendorId} = req.query;
      const chat = await Chat.findOne({
        user: id,
        studio: vendorId,
      }).populate('messages');  
      res.status(200).json(chat);
    } catch (error) {
      console.error('Error finding chat:', error);
      throw error;  
    }
  }
  
