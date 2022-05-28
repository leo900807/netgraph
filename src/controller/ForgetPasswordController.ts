import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { MailingController } from "./MailingController";
import { validationResult } from "express-validator";
import * as randomstring from "randomstring";
import autobind from "class-autobind";

export class ForgetPasswordController extends MailingController{

    private userRepository = AppDataSource.getRepository(User);

    constructor(){
        super();
        autobind(this);
    }

    async new_mail(req: Request, res: Response, next: NextFunction){
        res.render("forget_mail", { title: "Forget Password" });
    }

    async create_mail(req: Request, res: Response, next: NextFunction){
        const { username, email } = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render("forget_mail", {
                errors: errors.array(),
                username: username,
                email: email
            });
        let user = await this.userRepository.findOneBy({ userName: username });
        if(email != user.email)
            return res.render("forget_mail", {
                errors: [{ msg: "Email address for this user is incorrect" }],
                username: username,
                email: email
            });
        let change_token = randomstring.generate(64);
        while(await this.userRepository.findOneBy({ changeToken: change_token }))
            change_token = randomstring.generate(64);
        user.changeToken = change_token;
        user.changeTokenCreatedAt = new Date();
        await this.userRepository.save(user);
        this.sendMail({
            from: "Netgraph project",
            to: email,
            subject: "Change Password for Netgraph Account",
            html: `
            <h1>Forget Password</h1>
            <p>You (${user.userName}) just request to change your password on <a href="${process.env["website_url"]}">Netgraph</a>.<br>Please go to the following website to change your password.</p>
            <p>Change Link: ${process.env["website_url"]}/change/${change_token}</p>
            <p><font color="red"><B>Note: This link will be expired in 1 hour. The link will also become invalid if you send a new changing request.</B></font></p>
            <p>Best regards,<br>Netgraph project</p>
            `
        });
        res.render("change_mail_success");
    }

};
