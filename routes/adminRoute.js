
import express from 'express'
import { adminLogin, blockStudio, blockUser, blockVendor, userList, vendorList } from "../controllers/adminController.js";
const adminRoute = express()

adminRoute.post('/login',adminLogin)
adminRoute.get('/userList',userList)
adminRoute.get('/vendorList', vendorList); 
adminRoute.patch('/vendorBlock',blockVendor)
adminRoute.patch('/userBlock',blockUser)      
adminRoute.patch('/studioBlock',blockStudio)      
export default adminRoute;   