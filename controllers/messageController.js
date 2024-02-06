import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import { ObjectId } from 'mongoose';

// ... rest of your code


export const sendMessage = async (req, res) => {
    try {
      const { newMessage, sender, receiver } = req.body;
      const message = new Message({   
        content: newMessage,  
        sender: { id: sender.id, role: sender.role }, 
        receiver: { id: receiver.id, role: receiver.role } 
      }); 
      const savedMessage = await message.save();
       
      let chat = await Chat.findOne({
        $or: [
          { user: receiver.id, studio: sender.id },
          { user: sender.id, studio: receiver.id }
        ]
      });
      if (chat) {
        chat.messages.push(savedMessage._id);
        await chat.save();
      }
      
      res.status(200).json({savedMessage,chat});
    } catch (error) {
      console.log(error.message); 
      res.status(500).json('Internal server error')
    }
  };
  

export const allMessages = async (req,res) =>{
    try {
        const {chatId} = req.body;
        const chat = await Chat.findById(chatId).populate('messages');
        res.json(chat.messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
