import { body } from "express-validator"

const userRegisterValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("invaild Email"),

        body("username")
            .trim()
            .notEmpty()
            .withMessage("Username is required")
            .isLowercase()
            .withMessage("Username must be in lowercase")
            .isLength({ min: 3 })
            .withMessage("Username must be 3 charectors long"),

        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),

        body("fullName")
            .optional()
            .trim()
    ]
}
export {
userRegisterValidator
}