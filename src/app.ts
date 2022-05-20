import * as express from "express";
import * as bodyParser from "body-parser";
import { Request, Response } from "express";
import * as morgan from "morgan";
import * as session from "express-session";
import * as redis from "redis";
import * as connectRedis from "connect-redis"
import * as engine from "ejs-locals";
import * as flash from "connect-flash";
import * as csrf from "csurf";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import * as router from "./router";
import * as randomstring from "randomstring";
import * as bcrypt from "bcrypt";
import * as path from "path";
import "dotenv/config";

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express();
    app.use(morgan("combined"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    // setup ejs engine
    app.engine("ejs", engine);
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "ejs");

    // setup session options
    const RedisStore = await connectRedis(session);
    const redisClient = await redis.createClient({ url: "redis://localhost:6379", legacyMode: true });
    await redisClient.connect().catch(console.error);
    app.use(session({
        secret: randomstring.generate(128),
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 30 * 60 * 1000 },
        store: new RedisStore({ client: redisClient })
    }));

    // setup path to static assets
    app.use(express.static(path.join(__dirname, "public")));

    // setup flash message
    app.use(flash());

    app.use((req, res, next) => {
        res.locals.info = req.flash("info");
        res.locals.error = req.flash("error");
        next();
    });

    // setup csrf protection
    const csrfProtection = csrf();
    app.use(csrfProtection);

    // register express routes from defined application routes
    app.use(router);

    // setup 404 route
    app.use("*", (req: Request, res: Response) => {
        res.status(404).render("404");
    });

    // setup express app here
    // ...

    // start express server
    app.listen(3000);

    // insert new users for test
    var user = new User();
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

}).catch(error => console.log(error))
