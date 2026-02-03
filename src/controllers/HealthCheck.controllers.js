import ApiResponse from '../utils/Api-Response.js'
const HeathCheck=async(req,res,next)=>{
try {
    res.status(200).json(new ApiResponse(200,{message:"server is running"}))
} catch (error) {
    next(error)
}
}
export default HeathCheck