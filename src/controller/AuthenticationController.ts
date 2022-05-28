import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { ApplicationController } from "./ApplicationController";
import * as bcrypt from "bcrypt";
import autobind from "class-autobind";

export class AuthenticationController extends ApplicationController{

    private userRepository = AppDataSource.getRepository(User);

    constructor(){
        super();
        autobind(this);
    }

    async auth_or_redirect(req: Request, res: Response, next: NextFunction){
        const { redirect_to } = req.params;
        if(this.is_auth(req))
            res.redirect(`/${redirect_to}`);
        else
            next();
    }

    async new(req: Request, res: Response, next: NextFunction){
        res.render("auth", { title: "Authenticate" });
    }

    async create(req: Request, res: Response, next: NextFunction){
        const { password } = req.body;
        const { redirect_to } = req.params;
        if(password == ""){
            req.flash("error", "Password is required");
            return res.redirect(req.path);
        }
        const user = await this.userRepository.findOneBy({ id: req.session.userid });
        bcrypt.compare(password, user.encryptedPwd).then(result => {
            if(result){
                req.session.last_auth = Date.now();
                console.log(`User ${user.userName} passed registration authentication`);
                return res.redirect(`/${redirect_to}`);
            }
            else{
                req.flash("error", "Invalid password");
                console.log(`User ${user.userName} tried to pass registration authentication but in vain`);
                return res.redirect(req.path);
            }
        });
    }

};
