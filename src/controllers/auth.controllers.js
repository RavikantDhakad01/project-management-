import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mails.js"
import ApiResponse from "../utils/Api-Response.js"
import { apiErrors } from "../utils/Api-errors.js"
import User from "../models/User.Model.js"


const genrateAccessTokenAndRefreshToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const AccessToken = user.generateAccessToken()
        const RefreshToken = user.generateRefressToken()
        user.refreshToken = RefreshToken

        await user.save({ validateBeforeSave: false })

        return { AccessToken, RefreshToken }
    } catch (error) {
        throw new apiErrors(500, "Something went wrong while generating access token")
    }
}

const registerUser = async (req, res, next) => {

    try {

        const { email, username, password, role } = req.body

        const existedUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existedUser) {
            throw new apiErrors(409, "User with email or username already exists", [])
        }

        const user = await User.create({
            email, username, password, isEmailVerified: false
        })


        const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()
        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry

        await user.save({ validateBeforeSave: false })

        await sendEmail({
            email: user?.email,
            subject: "Please verify your email",
            mailGenContent: emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`)
        })

        const createdUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        return res.status(201).json(
            new ApiResponse(201, { user: createdUser }, "User registered successfully and verification email has been sent on your email")
        )

    } catch (error) {
        next(error)
    }

}

const login = async (req, res, next) => {

    try {
        const { email, password } = req.body

        if (!email) {
            throw new apiErrors(400, "Email is required")
        }

        const user = await User.findOne({ email })

        if (!user) {
            throw new apiErrors(400, "User does not exist")
        }
        const isPassValid = await user.isPasswordCorrect(password)

        if (!isPassValid) {
            throw new apiErrors(400, "Inavail credentials")
        }
        const { AccessToken, RefreshToken } = await genrateAccessTokenAndRefreshToken(user._id)

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

        const options = {
            httpOnly: true,
            secure: true
        }
        return res.status(200)
            .cookie("accessToken", AccessToken, options)
            .cookie("refreshToken", RefreshToken, options)
            .json(new ApiResponse(200, {
                user: loggedInUser,
                AccessToken
            },
                "User logged in successfully"
            ))
    } catch (error) {
        next(error)
    }
}

export { registerUser, login }