import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express";
import { User } from "../entity/User";
import { RegistrationToken } from "../entity/RegistrationToken";
import { ApplicationController } from "./ApplicationController";
import { validationResult } from "express-validator";
import { google } from "googleapis";
import * as nodemailer from "nodemailer";
import * as randomstring from "randomstring";
import autobind from "class-autobind";

export class RegistrationController extends ApplicationController{

    private userRepository = AppDataSource.getRepository(User);
    private tokenRepository = AppDataSource.getRepository(RegistrationToken);

    private OAuth2Client = new google.auth.OAuth2(process.env["Gmail_client_id"], process.env["Gmail_client_secret"], process.env["Gmail_redirect_uri"]);

    constructor(){
        super();
        autobind(this);
        this.OAuth2Client.setCredentials({ refresh_token: process.env["Gmail_refresh_token"] });
    }

    private is_expired(token: RegistrationToken){
        if(Date.now() - token.createdAt.getTime() > 60 * 60 * 24 * 1000)
            return true;
        return false;
    }

    private async sendMail(addr: string, token: string){
        try{
            const accessToken = await this.OAuth2Client.getAccessToken();
            const mailer = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    type: "OAuth2",
                    user: process.env["Gmail_account"],
                    clientId: process.env["Gmail_client_id"],
                    clientSecret: process.env["Gmail_client_secret"],
                    refreshToken: process.env["Gmail_refresh_token"],
                    accessToken: accessToken
                }
            });
            mailer.sendMail({
                from: "Netgraph project",
                to: addr,
                subject: "Registration mail for netgraph",
                html: `
                <h1>Netgraph Registration</h1>
                <p>You are invited to register as an admin of <a href="${process.env["website_url"]}">Netgraph</a>.<br>Please go to the following website to compelete the registration procedure.</p>
                <p>Registration Link: http://${process.env["website_url"]}/register/${token}</p>
                <p><font color="red"><B>Note: This link will be expired in 24 hours.</B></font></p>
                <p>Best regards,<br>Netgraph project</p>
                `
            }, (err, info) => {
                if(err)
                    console.log(`Unable to send mail to ${addr}: ${err}`);
                else
                    console.log(info);
            });
        } catch(err){
            console.log(err);
        }
    }

    async new_mail(req: Request, res: Response, next: NextFunction){
        res.render("register_mail", { csrfToken: req.csrfToken() });
    }

    async create_mail(req: Request, res: Response, next: NextFunction){
        const { email } = req.body;
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render("register_mail", {
                errors: errors.array(),
                csrfToken: req.csrfToken(),
                email: email
            });
        var registration_token = randomstring.generate(64);
        while(await this.tokenRepository.findOneBy({ token: registration_token }))
            registration_token = randomstring.generate(64);
        let reg_token = new RegistrationToken();
        reg_token.token = registration_token;
        await this.tokenRepository.save(reg_token);
        this.sendMail(email, registration_token);
        res.render("register_mail_success");
    }

    async new_user(req: Request, res: Response, next: NextFunction){
        const token = await this.tokenRepository.findOneBy({ token: req.params.token });
        if(!token || token.usedBy)
            this.raise404(req, res, next);
        if(this.is_expired(token))
            return res.render("register_expired");
        res.render("register_user", { csrfToken: req.csrfToken() });
    }

    async create_user(req: Request, res: Response, next: NextFunction){
        const token = await this.tokenRepository.findOneBy({ token: req.params.token });
        const { username, password, re_password } = req.body;
        if(!token)
            return res.sendStatus(403);
        if(token.usedBy)
            this.raise404(req, res, next);
        if(this.is_expired(token))
            return res.render("register_expired");
        const errors = validationResult(req);
        if(!errors.isEmpty())
            return res.render("register_user", {
                errors: errors.array(),
                csrfToken: req.csrfToken(),
                username: username,
                password: password,
                re_password: re_password
            });
        if(await this.userRepository.findOneBy({ userName: username }))
            return res.render("register_user", {
                errors: [{ msg: "Username has been used" }],
                csrfToken: req.csrfToken(),
                username: username,
                password: password,
                re_password: re_password
            });
        let user = new User();
        user.userName = user.nickName = username;
        user.encryptedPwd = await this.encryptPwd(password);
        await this.userRepository.save(user);
        token.usedBy = user.id;
        await this.tokenRepository.save(token);
        console.log(`Saved a new user wich {\n\tid: ${user.id},\n\tuserName: ${user.userName}}`);
        res.render("register_user_success");
    }

};
