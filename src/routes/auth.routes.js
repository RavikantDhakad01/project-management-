import { Router } from "express";

import { registerUser, login, logoutUser, getCurrentUser, verifyEmail, resendEmailVerification, refreshAccessToken, forgotPasswordRequest, resetPassword, changePassword } from "../controllers/auth.controllers.js"

import { userRegisterValidator, LoginValidator, forgotPasswordValidator, resetPasswordValidator, changePasswordvalidator } from "../validators/index.js"

import { validate } from "../middlewares/validator.middleware.js"
import { verifyToken } from "../middlewares/auth.middleware.js"

const router = Router()

//un-protected routes
router.route("/register").post(userRegisterValidator(), validate, registerUser)
router.route("/login").post(LoginValidator(), validate, login)
router.route("/verify-email/:verificationToken").get(verifyEmail)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/forgot-password").post(forgotPasswordValidator(), validate, forgotPasswordRequest)
router.route("/reset-password/:token").post(resetPasswordValidator(), validate, resetPassword)


//protected routes
router.route("/logout").post(verifyToken, logoutUser)
router.route("/current-user").post(verifyToken, getCurrentUser)
router.route("/resend-email-verification").post(verifyToken, resendEmailVerification)
router.route("/change-password").post(verifyToken, changePasswordvalidator(), validate, changePassword)

export default router