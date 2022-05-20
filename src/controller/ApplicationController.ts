import { NextFunction, Request, Response } from "express";
import * as bcrypt from "bcrypt";
import autobind from "class-autobind";

export class ApplicationController{

    constructor(){
        autobind(this);
    }

    async encryptPwd(Pwd: string): Promise<string|null>{
        return await new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, Salt) => {
                bcrypt.hash(Pwd, Salt, (err, hash) => {
                    if(err){
                        console.log("It occurs some errors when encrypting");
                        reject(null);
                    }
                    resolve(hash);
                });
            })
        });
    }

    is_auth(req: Request){
        return req.session.last_auth && Date.now() - req.session.last_auth <= 60 * 10 * 1000;
    }

    async authenticate_user(req: Request, res: Response, next: NextFunction){
        if(!req.session.userid)
            this.raise404(req, res, next);
        if(next)
            next();
    }

    async authenticate_again(req: Request, res: Response, next: NextFunction){
        this.authenticate_user(req, res, null);
        if(this.is_auth(req))
            next();
        else
            res.redirect("/auth" + req.path);
    }

    async raise404(req: Request, res: Response, next: NextFunction){
        res.status(404).render("404");
    }

};
