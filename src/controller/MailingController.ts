import { ApplicationController } from "./ApplicationController";
import { google } from "googleapis";
import { SendMailOptions, createTransport } from "nodemailer";
import { SmtpOptions } from "nodemailer-smtp-transport";
import autobind from "class-autobind";

export class MailingController extends ApplicationController{

    private OAuth2Client = new google.auth.OAuth2(process.env["Gmail_client_id"], process.env["Gmail_client_secret"], process.env["Gmail_redirect_uri"]);

    constructor(){
        super();
        autobind(this);
        this.OAuth2Client.setCredentials({ refresh_token: process.env["Gmail_refresh_token"] });
    }

    async sendMail(mailOptions: SendMailOptions){
        try{
            const accessToken = await this.OAuth2Client.getAccessToken();
            const mailer = createTransport({
                service: "Gmail",
                auth: {
                    type: "OAuth2",
                    user: process.env["Gmail_account"],
                    clientId: process.env["Gmail_client_id"],
                    clientSecret: process.env["Gmail_client_secret"],
                    refreshToken: process.env["Gmail_refresh_token"],
                    accessToken: accessToken.token
                }
            } as SmtpOptions);
            mailer.sendMail(mailOptions, (err, info) => {
                if(err)
                    console.log(`Unable to send mail to ${mailOptions.to}: ${err}`);
                else
                    console.log(info);
            });
        } catch(err){
            console.log(err);
        }
    }

};
