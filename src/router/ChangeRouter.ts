import { ChangeController } from "../controller/ChangeController";
import { check } from "express-validator";

export const ChangeRouter = [{
    method: "get",
    route: "/:token",
    controller: ChangeController,
    action: "edit",
    middlewares: []
}, {
    method: "post",
    route: "/:token",
    controller: ChangeController,
    action: "update",
    middlewares: [
        check("email").isEmail().withMessage("Invalid email address"),
        check("new_password").custom((value, { req }) => {
            if(value !== "" && value.length < 5)
                throw new Error("Length of new password is at least 5 characters");
            return true;
        }),
        check("re_password").custom((value, { req }) => {
            if(req.body.new_password !== "" && value === "")
                throw new Error("Repeat password is required");
            if(value !== req.body.new_password)
                throw new Error("Password and repeat password are not same");
            return true;
        })
    ]
}];
