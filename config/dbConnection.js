import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const dbconnect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.log(err);
    });
};  
export default dbconnect;
