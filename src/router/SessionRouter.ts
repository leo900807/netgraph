import { SessionController } from "../controller/SessionController";

export const SessionRouter = [{
    method: "get",
    route: "/",
    controller: SessionController,
    action: "new",
    middlewares: []
}, {
    method: "post",
    route: "/",
    controller: SessionController,
    action: "create",
    middlewares: []
}, {
    method: "delete",
    route: "/",
    controller: SessionController,
    action: "delete",
    middlewares: []
}];
