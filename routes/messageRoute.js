import  express  from "express";
import { allMessages, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router()
messageRouter.post('/',sendMessage)
messageRouter.get('/all',allMessages)
export default messageRouter; 