import express from "express";
import { vendorData, userData, findChatByUserAndStudio, studioChatList } from "../controllers/chatController.js";

const chatRouter = express.Router()

chatRouter.get('/vendorData/:id',vendorData);
chatRouter.get('/userData/:id',userData)
// chatRouter.get('/chats',findChatByUserAndStudio) 

chatRouter.get('/chats', (req, res, next) => {
    const { id, vendorId } = req.query;
  

    findChatByUserAndStudio(req, res, next, id, vendorId);
  });
chatRouter.get('/chatList',(req,res,next)=>{
  const {id} = req.query;
  studioChatList(req,res,next,id)
})
  
export default chatRouter;  