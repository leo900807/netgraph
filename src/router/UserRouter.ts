import { UserController } from "../controller/UserController";
import { ApplicationController } from "../controller/ApplicationController";

export const UserRouter = [{
    method: "get",
    route: "/",
    controller: UserController,
    action: "user",
    middlewares: [ (new ApplicationController).authenticate_user ]
}, {
    method: "post",
    route: "/change",
    controller: UserController,
    action: "create_change_mail",
    middlewares: [ (new ApplicationController).authenticate_user ]
}];
