import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../utils/mails.js"
import ApiResponse from "../utils/Api-Response.js"
import { apiErrors } from "../utils/Api-errors.js"
import User from "../models/User.Model.js"
import jwt from "jsonwebtoken"


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
        return next(error)
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
        return next(error)
    }
}

const logoutUser = async (req, res, next) => {

    try {
        await User.findByIdAndUpdate(req.user._id,
            {
                $set: {
                    refreshToken: ""
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }
        res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("accessToken", options)
            .json(new ApiResponse(200, {}, "User logged out"))
    } catch (error) {
        return next(error)
    }

}

const getCurrentUser = async (req, res, next) => {
    res.status(200).json(new ApiResponse(200, req.user, "Current user fetched successfully"))
}

const verifyEmail = async (req, res, next) => {

    try {
        const { verificationToken } = req.params
        if (!verificationToken) {
            throw new apiErrors(400, "Email verification token is missing")
        }

        let hashedToken = crypto().createHash("sha256")
            .update(verificationToken)
            .digest("hex")

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: { $gt: Date.now() }
        })

        if (!user) {
            throw new apiErrors(400, "Token is invalid or expired")
        }

        user.emailVerificationToken = undefined
        user.emailVerificationExpiry = undefined
        user.isEmailVerified = true

        await user.save({ validateBeforeSave: false })

        return res.status(200).json(200, new ApiResponse(200, { isEmailVerified: user.isEmailVerified }, "Email is verified"))

    } catch (error) {
        return next(error)
    }


}

const resendEmailVerification = async (req, res, next) => {

    try {
        const user = await User.findById(req.user?._id)
        if (!user) {
            throw new apiErrors(404, "user does not exist")
        }
        if (user.isEmailVerified) {
            throw new apiErrors(409, "Email is already verified")
        }
        const { unHashedToken, hashedToken, tokenExpiry } =
            user.generateTemporaryToken();

        user.emailVerificationToken = hashedToken
        user.emailVerificationExpiry = tokenExpiry

        await user.save({ validateBeforeSave: false })

        await sendEmail({
            email: user?.email,
            subject: "Please verify your email",
            mailGenContent: emailVerificationMailgenContent(user.username, `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`)
        })

        return res.status(200).json(200, {}, "Mail has been sent to your email ID")

    } catch (error) {
        return next(error)
    }
}

const refreshAccessToken = async (req, res, next) => {

    try {
        const refreshToken = req.cookies?.refreshToken || req.body.refreshToken

        if (!refreshToken) {
            throw new apiErrors(401, "Unauthorized access")
        }

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECERT)

        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new apiErrors(401, "Invalid refresh token")
        }

        if (refreshToken !== user?.refreshToken) {
            throw new apiErrors(401, "Refresh token in expired")
        }

        const { accessToken, RefreshToken: newRefreshToken } = await genrateAccessTokenAndRefreshToken(user._id)


        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(200, {
                accessToken, refreshToken: newRefreshToken
            },
                "Access token refreshed"
            )
    } catch (error) {
        return next(error)
    }

}

const forgotPasswordRequest = async (req, res, next) => {
    try {

        const { email } = req.body
        const user = await User.findOne({ email })

        if (!user) {
            throw new apiErrors(404, "User does not exists")
        }

        const { unHashedToken, hashedToken, tokenExpiry } =
            user.generateTemporaryToken();

        user.forgotPasswordToken = hashedToken
        user.forgotPasswordExpiry = tokenExpiry

        await user.save({ validateBeforeSave: false })

        await sendEmail({
            email: user?.email,
            subject: "Password reset request",
            mailGenContent: forgotPasswordMailgenContent(user.username,
                `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`)
        })

        return res.status(200).json(new ApiResponse(200, {}, "Password reset mail has been sent on your mail id"))

    } catch (error) {
        return next()
    }
}

const resetPassword = async (req, res, next) => {

    try {
        const { token } = req.params
        const { newPassword } = req.body


        if (!token) {
            throw new apiErrors(401, "Unauthorized access")
        }
        let hashedToken = crypto()
            .createHash("sha256")
            .update(token)
            .digest("hex")

        const user = await User.findOne({
            forgotPasswordToken: hashedToken,
            forgotPasswordExpiry: { $gt: Date.now() }
        })

        if (!user) {
            throw new apiErrors(489, "Token is inavaild or expired")
        }
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        user.password = newPassword

        user.save({ validateBeforeSave: false })

        return res.status(200).json(new ApiResponse(200, {}, "password reset successfully"))

    } catch (error) {
        return next(error)
    }
}

const changePassword = async (req, res, next) => {

    try {

        const { oldPassword, newPassword } = req.body

        const user = await User.findById(req.user?._id)

        if (!user) {
            throw new apiErrors(400, "User does not exist")
        }
        const isPassVaild = await user.isPasswordCorrect(oldPassword)

        if (!isPassVaild) {
            throw new apiErrors(400, "Invalid old Password")
        }

        user.password = newPassword
        user.save({ validateBeforeSave: false })

        return res.status(200).json(200, {}, "password changed successfully")

    } catch (error) {
        return next(error)
    }

}


export { registerUser, login, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, forgotPasswordRequest, resetPassword, changePassword }