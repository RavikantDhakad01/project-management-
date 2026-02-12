import { Router } from "express";
import { registerUser, login } from "../controllers/auth.controllers.js"
import { userRegisterValidator, LoginValidator } from "../validators/index.js"
import { validate } from "../middlewares/validator.middleware.js"

const router = Router()

router.route("/register").post(userRegisterValidator(), validate, registerUser)
router.route("/login").post(LoginValidator(), validate, login)

export default router