import bcrypt from "bcrypt";
const securePassword = async(password)=>{
    try {
        const salt = await bcrypt.genSalt(2)
        const hashed = await bcrypt.hash(password,salt)
        return hashed;
    } catch (error) {
        console.log(error);
    }
}
export default securePassword;