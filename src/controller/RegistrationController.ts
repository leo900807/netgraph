import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { RegistrationToken } from "../entity/RegistrationToken";
import { MailingController } from "./MailingController";
import { validationResult } from "express-validator";
import * as randomstring from "randomstring";
import autobind from "class-autobind";

export class RegistrationController extends MailingController{

    private userRepository = AppDataSource.getRepository(User);
    private tokenRepository = AppDataSource.getRepository(RegistrationToken);

    constructor(){
        super();
        autobind(this);
    }

    private is_expired(token: RegistrationToken){
        if(Date.now() - token.createdAt.getTime() > 60 * 60 * 24 * 1000)
            return true;
        return false;
    }

    async new_mail(req: Request, res: Response, next: NextFunction){
        res.render("register_mail");
    }

    async create_mail(req: Request, res: Response, next: NextFunction){
        const { email } = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render("register_mail", {
                errors: errors.array(),
                email: email
            });
        let registration_token = randomstring.generate(64);
        while(await this.tokenRepository.findOneBy({ token: registration_token }))
            registration_token = randomstring.generate(64);
        let reg_token = new RegistrationToken();
        reg_token.token = registration_token;
        await this.tokenRepository.save(reg_token);
        this.sendMail({
            from: "Netgraph project",
            to: email,
            subject: "Registration mail for Netgraph",
            html: `
            <h1>Netgraph Registration</h1>
            <p>You are invited to register as an admin of <a href="${process.env["website_url"]}">Netgraph</a>.<br>Please go to the following website to compelete the registration procedure.</p>
            <p>Registration Link: ${process.env["website_url"]}/register/${registration_token}</p>
            <p><font color="red"><B>Note: This link will be expired in 24 hours.</B></font></p>
            <p>Best regards,<br>Netgraph project</p>
            `
        });
        res.render("register_mail_success");
    }

    async new_user(req: Request, res: Response, next: NextFunction){
        const token = await this.tokenRepository.findOneBy({ token: req.params.token });
        if(!token || token.usedBy)
            next("Not Found");
        if(this.is_expired(token))
            return res.render("register_expired");
        res.render("register_user", { title: "Register" });
    }

    async create_user(req: Request, res: Response, next: NextFunction){
        const token = await this.tokenRepository.findOneBy({ token: req.params.token });
        const { username, password, email } = req.body;
        if(!token)
            return res.sendStatus(403);
        if(token.usedBy)
            next("Not Found");
        if(this.is_expired(token))
            return res.render("register_expired");
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render("register_user", {
                errors: errors.array(),
                username: username,
                email: email
            });
        if(await this.userRepository.findOneBy({ userName: username }))
            return res.render("register_user", {
                errors: [{ msg: "Username has been used" }],
                username: username,
                email: email
            });
        let user = new User();
        user.userName = user.nickName = username;
        user.encryptedPwd = await this.encryptPwd(password);
        user.email = email;
        await this.userRepository.save(user);
        token.usedBy = user.id;
        await this.tokenRepository.save(token);
        console.log(`Saved a new user with {\n\tid: ${user.id},\n\tuserName: ${user.userName}}`);
        res.render("register_user_success");
    }

};
