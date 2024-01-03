import mongoose from "mongoose";

const userSechema =  new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    email:{
        type: String,
        required:true,
    },
    mobile:{
        type: String,
        
    },
    password:{
        type: String,
        required: true,
    },
    isEmailVerified:{
        type: Boolean,
        default:false,
    },
    isBlocked:{
        type: Boolean,
        default:false,
    },
    profileImage:{
        type: String,
    },
    walletHistory:[{
        date:{
          type: Date
        },
        amount:{
            type: Number
        },
        description:{
            type: String
        },
    },
],
wallet:{
    type: Number,
    default: 0,
},
},{timestamps:true});
export default mongoose.model("User",userSechema);