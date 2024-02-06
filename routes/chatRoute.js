import express from "express";
import { vendorData, userData, findChatByUserAndStudio } from "../controllers/chatController.js";

const chatRouter = express.Router()

chatRouter.get('/vendorData/:id',vendorData);
chatRouter.get('/userData/:id',userData)
// chatRouter.get('/chats',findChatByUserAndStudio) 
// Assuming findChatByUserAndStudio is a middleware or route handler function

chatRouter.get('/chats', (req, res, next) => {
    const { id, vendorId } = req.query;
  

    findChatByUserAndStudio(req, res, next, id, vendorId);
  });
  
 
export default chatRouter;  