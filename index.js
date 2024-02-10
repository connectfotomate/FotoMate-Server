import express from 'express';
import { createServer } from 'http'; 
import cors from 'cors';

import dbconnect from './config/dbConnection.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import vendorRoute from './routes/vendorRoute.js';
import chatRouter from './routes/chatRoute.js';
import setupSocketIO from './socketIo.js';
import messageRouter from './routes/messageRoute.js';

const app = express();
const server = createServer(app); 

const PORT = 3000;

app.use(cors({ 
  credentials:true
 }));

dbconnect();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/', userRoute);
app.use('/admin', adminRoute);
app.use('/vendor', vendorRoute);
app.use('/chat',chatRouter)
app.use('/message',messageRouter)

app.use((err, req, res, next) => { 
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

server.listen(PORT, () => {
  console.log(`server is running on port http://localhost:${PORT}`);
});

// Set up Socket.IO
setupSocketIO(server);
