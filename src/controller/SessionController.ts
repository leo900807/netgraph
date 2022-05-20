import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { ApplicationController } from "./ApplicationController";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";
import autobind from "class-autobind";

export class SessionController extends ApplicationController{

    private userRepository = AppDataSource.getRepository(User);

    constructor(){
        super();
        autobind(this);
    }

    async new(req: Request, res: Response, next: NextFunction){
        res.render("login", { csrfToken: req.csrfToken() });
    }

    async create(req: Request, res: Response, next: NextFunction){
        const { username, password } = req.body;
        if(username == "" || password == ""){
            req.flash("error", "Username and password are both required");
            return res.redirect("/login");
        }
        const user = await this.userRepository.findOneBy({ userName: username });
        if(!user){
            req.flash("error", "Invalid user");
            return res.redirect("/login");
        }
        bcrypt.compare(password, user.encryptedPwd).then(result => {
            if(result){
                req.session.userid = user.id;
                req.flash("info", "Successful logged in");
                console.log(`User ${user.userName} logged in`);
                return res.redirect("/");
            }
            else{
                req.flash("error", "Invalid password");
                console.log(`User ${user.userName} tried to log in`);
                return res.redirect("/login");
            }
        });
    }

    async delete(req: Request, res: Response, next: NextFunction){
        req.session.destroy();
        return res.redirect(303, "/");
    }

};
