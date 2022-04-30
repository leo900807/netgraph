import { IndexController } from "../controller/IndexController";

export const IndexRouter = [{
    method: "get",
    route: "/",
    controller: IndexController,
    action: "show",
    middlewares: []
}];
