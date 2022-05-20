import { RegistrationController } from "../controller/RegistrationController";
import { ApplicationController } from "../controller/ApplicationController";
import { check } from "express-validator";

export const RegistrationRouter = [{
    method: "get",
    route: "/",
    controller: RegistrationController,
    action: "new_mail",
    middlewares: [ (new ApplicationController).authenticate_again ]
}, {
    method: "post",
    route: "/",
    controller: RegistrationController,
    action: "create_mail",
    middlewares: [
        (new ApplicationController).authenticate_again,
        check("email").isEmail().withMessage("Invalid Email Address")
    ]
}, {
    method: "get",
    route: "/:token",
    controller: RegistrationController,
    action: "new_user",
    middlewares: []
}, {
    method: "post",
    route: "/:token",
    controller: RegistrationController,
    action: "create_user",
    middlewares: [
        check("username").isLength({ min: 3, max: 20 }).withMessage("Length of username should be 3 to 20 characters")
            .matches("^[A-Za-z0-9_]*$").withMessage("Username can only contains alpha, number and underscores(_)"),
        check("password").notEmpty().withMessage("Password is required").bail()
            .isLength({ min: 5 }).withMessage("Length of password is at least 5 characters"),
        check("re_password").custom((value, {req}) => {
            if(value === "")
                throw new Error("Repeat password is required");
            if(value !== req.body.password)
                throw new Error("Password and repeat password are not same");
            return true;
        })
    ]
}];
