import bcrypt from "bcrypt";
const securePassword = async (password) => {
    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const hashed = await bcrypt.hash(password, salt);
        return hashed;
    } catch (error) {
        console.error(`Error in securePassword: ${error.message}`);
        throw new Error('Password hashing failed');
    }
};

export default securePassword;
