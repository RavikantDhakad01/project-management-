import User from "../models/User.Model.js"
import jwt from 'jsonwebtoken'
import { apiErrors } from "../utils/Api-errors.js"

const verifyToken = async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new apiErrors(401,"UnAuthorized request")
    }

    try {
      const decodedToken =jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)  
      const user =await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

      if(!user){
        throw new apiErrors(401,"Invaid access token")
      }

      req.user=user
      next()
    } catch (error) {
        next(error)
    }
}
export {
  verifyToken
}