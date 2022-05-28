import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { ApplicationController } from "./ApplicationController";
import { validationResult } from "express-validator";
import autobind from "class-autobind";

export class ChangeController extends ApplicationController{

    private userRepository = AppDataSource.getRepository(User);

    constructor(){
        super();
        autobind(this);
    }

    private is_expired(user: User){
        if(Date.now() - user.changeTokenCreatedAt.getTime() > 60 * 60 * 1000)
            return true;
        return false;
    }

    async edit(req: Request, res: Response, next: NextFunction){
        const user = await this.userRepository.findOneBy({ changeToken: req.params.token });
        if(!user)
            next("Not Found");
        if(this.is_expired(user))
            return res.render("change_expired");
        res.render("change", { title: "Change Password", email: user.email });
    }

    async update(req: Request, res: Response, next: NextFunction){
        const { email, new_password } = req.body;
        const errors = validationResult(req);
        let user = await this.userRepository.findOneBy({ changeToken: req.params.token });
        if(!user)
            next("Not Found");
        if(this.is_expired(user))
            res.render("change_expired");
        if(!errors.isEmpty())
            return res.render("change", {
                errors: errors.array(),
                email: user.email
            });
        user.email = email;
        user.changeToken = user.changeTokenCreatedAt = null;
        if(new_password !== "")
            user.encryptedPwd = await this.encryptPwd(new_password);
        await this.userRepository.save(user);
        if(new_password !== ""){
            const client = req.app.get("redis");
            await client.smembers(user.id.toString(), async (err, sessionIDs) => {
                if(err)
                    console.log(err);
                else{
                    if(sessionIDs.length > 0){
                        await client.del.apply(client, sessionIDs);
                        await client.del(user.id.toString());
                    }
                }
            });
        }
        res.render("change_success", { relogin: new_password !== "" ? true : false });
    }

};
