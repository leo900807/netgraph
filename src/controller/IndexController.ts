import { NextFunction, Request, Response } from "express";
import { ApplicationController } from "./ApplicationController";
import autobind from "class-autobind";

export class IndexController extends ApplicationController{

    constructor(){
        super();
        autobind(this);
    }

    async show(req: Request, res: Response, next: NextFunction){
        if(req.session.userid)
            res.locals.userid = req.session.userid;
        res.render("index", { csrfToken: req.csrfToken() });
    }

};
