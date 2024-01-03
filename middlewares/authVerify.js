import jwt from 'jsonwebtoken'
const userSecret = process.env.USER_JWT_KEY
import User from '../models/userModel.js'

export const userTokenVerify = async (req, res, next) => {
  try {
    let token = req.headers.authorization
    if (!token) {
      return res.status(403).json({ message: 'Access Denied' })
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length).trimLeft()
    }
    const verified = jwt.verify(token, userSecret)
    req.user = verified 
    if (verified.role == 'user') {
      const user = await User.findOne({ email: verified.email })
      if (user.isBlocked) {
        return res.status(403).json({ message: 'User is blocked' })
      } else {
        next()
      }
    } else {
      return res.status(403).json({ message: 'Access Denied' })
    }
  } catch (error) {
    console.log(error.message)
  }
}
