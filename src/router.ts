import { Request, Response } from "express";
import { Router } from "express";
import { IndexRouter } from "./router/IndexRouter";
import { SessionRouter } from "./router/SessionRouter";
import { RegistrationRouter } from "./router/RegistrationRouter";
import { AuthenticationRouter } from "./router/AuthenticationRouter";

const router = Router();

const Routes = {
    "/": IndexRouter,
    "/login": SessionRouter,
    "/register": RegistrationRouter,
    "/auth": AuthenticationRouter
};

for(let routes in Routes){
    Routes[routes].forEach(route => {
        (router as any)[route.method](routes + route.route, route.middlewares, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res.send(result) : undefined)
            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })
}

module.exports = router;
