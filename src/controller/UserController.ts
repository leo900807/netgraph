import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { MailingController } from "./MailingController";
import * as randomstring from "randomstring";
import autobind from "class-autobind";

export class UserController extends MailingController{

    private userRepository = AppDataSource.getRepository(User);

    constructor(){
        super();
        autobind(this);
    }

    async user(req: Request, res: Response, next: NextFunction){
        const user = await this.userRepository.findOneBy({ id: req.session.userid });
        res.render("user_panel", { title: "User", username: user.userName });
    }

    async create_change_mail(req: Request, res: Response, next: NextFunction){
        const user = await this.userRepository.findOneBy({ id: req.session.userid });
        let change_token = randomstring.generate(64);
        while(await this.userRepository.findOneBy({ changeToken: change_token }))
            change_token = randomstring.generate(64);
        user.changeToken = change_token;
        user.changeTokenCreatedAt = new Date();
        await this.userRepository.save(user);
        this.sendMail({
            from: "Netgraph project",
            to: user.email,
            subject: "Change Password for Netgraph Account",
            html: `
            <h1>Change Password</h1>
            <p>You (${user.userName}) just request to change your password or email on <a href="${process.env["website_url"]}">Netgraph</a> user panel.<br>Please go to the following website to change your password.</p>
            <p>If you don't request to change password or email, it means that someone has signed in and sent this request.<br>We suggest you change your password to prevent your account from being compromised.</p>
            <p>Change Link: ${process.env["website_url"]}/change/${change_token}</p>
            <p><font color="red"><B>Note: This link will be expired in 1 hour. The link will also become invalid if you send a new changing request.</B></font></p>
            <p>Best regards,<br>Netgraph project</p>
            `
        });
        res.render("change_mail_success");
    }

};
