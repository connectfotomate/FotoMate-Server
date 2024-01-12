import express from 'express';
const app = express();
import http from 'http'

import dbconnect from './config/dbConnection.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import vendorRoute from './routes/vendorRoute.js';
 
import cors from 'cors'
const PORT = 3001;

app.use(cors({
    origin:'http://localhost:5173',
    methods:['GET','POST','PUT','PATCH'],
    credentials:true
}))
dbconnect()
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/",userRoute)
app.use("/admin",adminRoute)
app.use("/vendor",vendorRoute)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
  });
const server = http.createServer(app)
 server.listen(PORT,()=>{
    console.log(`server is running on port http://localhost:${PORT}`); 
 })
 


