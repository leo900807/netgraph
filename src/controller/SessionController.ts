import { getRepository } from "typeorm";
import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import * as bcrypt from "bcrypt";

export class SessionController{

    private userRepository = AppDataSource.getRepository(User);

    async new(req: Request, res: Response, next: NextFunction){
        res.render("login", { csrfToken: req.csrfToken() });
    }

    async create(req: Request, res: Response, next: NextFunction){
        if(req.body.username == "" || req.body.password == ""){
            req.flash("error", "Username and password are both required");
            return res.redirect("/login");
        }
        const user = await this.userRepository.findOneBy({ userName: req.body.username });
        if(!user){
            req.flash("error", "Invalid user");
            return res.redirect("/login");
        }
        bcrypt.compare(req.body.password, user.encryptedPwd).then(result => {
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
