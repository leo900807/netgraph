import { ForgetPasswordController } from "../controller/ForgetPasswordController";
import { check } from "express-validator";

export const ForgetPasswordRouter = [{
    method: "get",
    route: "/",
    controller: ForgetPasswordController,
    action: "new_mail",
    middlewares: []
}, {
    method: "post",
    route: "/",
    controller: ForgetPasswordController,
    action: "create_mail",
    middlewares: [
        check("username").notEmpty().withMessage("Username is required"),
        check("email").notEmpty().withMessage("Email address is required").bail()
            .isEmail().withMessage("Invalid Email Address")
    ]
}];
