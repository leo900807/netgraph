import { AuthenticationController } from "../controller/AuthenticationController";
import { ApplicationController } from "../controller/ApplicationController";

export const AuthenticationRouter = [{
    method: "get",
    route: "/:redirect_to",
    controller: AuthenticationController,
    action: "new",
    middlewares: [
        (new ApplicationController).authenticate_user,
        (new AuthenticationController).auth_or_redirect
    ]
}, {
    method: "post",
    route: "/:redirect_to",
    controller: AuthenticationController,
    action: "create",
    middlewares: [
        (new ApplicationController).authenticate_user,
        (new AuthenticationController).auth_or_redirect
    ]
}];
