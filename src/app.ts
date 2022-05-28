import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response, NextFunction } from "express";
import * as morgan from "morgan";
import * as session from "express-session";
import * as redis from "redis";
import * as connectRedis from "connect-redis"
import * as engine from "ejs-locals";
import * as flash from "connect-flash";
import * as csrf from "csurf";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import { RegistrationToken } from "./entity/RegistrationToken";
import AdminJS from "adminjs";
import * as AdminJSExpress from "@adminjs/express";
import * as TypeormAdapter from "@adminjs/typeorm";
import * as router from "./router";
import * as randomstring from "randomstring";
import * as bcrypt from "bcrypt";
import * as path from "path";
import "dotenv/config";

AdminJS.registerAdapter(TypeormAdapter);

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express();

    // setup admin page
    const Admin = {
        email: process.env["admin_email"],
        password: process.env["admin_password"]
    };

    // setup general settings
    app.use(morgan("combined"));

    // setup session options
    const RedisStore = await connectRedis(session);
    const redisClient = await redis.createClient({ url: "redis://localhost:6379", legacyMode: true });
    await redisClient.connect().catch(console.error);
    await redisClient.flushDb();
    app.use(session({
        secret: randomstring.generate(128),
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 30 * 60 * 1000 },
        store: new RedisStore({ client: redisClient })
    }));

    // setup admin pate
    const adminjs = new AdminJS({
        resources: [
            { resource: User, options: {
                parent: { name: "Database" },
                properties: { nickName: { isVisible: false } }
            } },
            { resource: RegistrationToken, options: { parent: { name: "Database" } } }
        ],
        branding: {
            companyName: "Netgraph Admin Page"
        }
    });
    // @ts-ignore TS2339
    const adminrouter = AdminJSExpress.buildAuthenticatedRouter(adminjs, {
        authenticate: async (email: string, password: string) => {
            if(Admin.email === email && Admin.password === password)
                return Admin;
            return false;
        },
        cookiePassword: randomstring.generate(128)
    }, null, {
        resave: false,
        saveUninitialized: true,
        store: new RedisStore({ client: redisClient })
    });
    app.use(adminjs.options.rootPath, adminrouter);
    app.set("redis", redisClient);

    // setup general settings
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // setup ejs engine
    app.engine("ejs", engine);
    app.set("views", path.join(__dirname, "view"));
    app.set("view engine", "ejs");
    app.disable("view cache");

    // setup path to static assets
    app.use(express.static(path.join(__dirname, "public")));

    // setup flash message
    app.use(flash());

    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.info = req.flash("info");
        res.locals.error = req.flash("error");
        next();
    });

    // setup csrf protection
    const csrfProtection = csrf();
    app.use(csrfProtection);
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.csrfToken = req.csrfToken();
        next();
    });

    // register express routes from defined application routes
    app.use(router);

    app.use("*", (req: Request, res: Response) => {
        res.status(404).render("404");
    });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack || err);
        if(err === "Not Found")
            res.status(404).render("404");
        else
            res.status(500);
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3000);

    // insert new users for test
    let user = new User();
    const pwd = randomstring.generate(8);
    user.userName = "admin";
    user.nickName = "admin";
    await bcrypt.genSalt(10, (err, Salt) => {
        bcrypt.hash(pwd, Salt, async (err, hash) => {
            if(err)
                return console.log("It occurs some errors when encrypting");
            user.encryptedPwd = hash;
            await AppDataSource.manager.save(user).then(res => {
                console.log(`Saved a new user with {\n\tid: ${user.id},\n\tuserName: ${user.userName},\n\tpassword: ${pwd}\n}`);
            }).catch(error => {
                console.log("Admin is already created before.");
            });
        });
    });

    console.log("Express server has started on port 3000. Open http://localhost:3000 to see results")

}).catch(error => console.log(error));
