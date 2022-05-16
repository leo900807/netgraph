import { NextFunction, Request, Response } from "express";

export class IndexController{

    constructor(){
        this.show = this.show.bind(this);
    }

    async show(req: Request, res: Response, next: NextFunction){
        if(req.session.userid)
            res.locals.userid = req.session.userid;
        res.render("index", { csrfToken: req.csrfToken() });
    }

};
