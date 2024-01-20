import passport from "passport";
import passportLocal from "passport-local";
import GitHubStrategy from "passport-github2";
import userModel from "../dao/models/user.model.js";
import { createHash, isValidPassword } from "../utils.js";

const localStrategy = passportLocal.Strategy;

const initializePassport = () => {
  // Usando estrategia de login con GitHub:
    passport.use(
        "github",
        new GitHubStrategy(
        {
            clientID: "Iv1.84f13a76a9373f39",
            clientSecret: "27d29dce2b2039d59cdc9aacb0ac0705336518cc",
            callbackURL: "http://localhost:8080/api/sessions/githubcallback",
        },
        async (accessToken, refreshToken, profile, done) => {
            console.log("Profile obtained from GitHub user:");
            //console.log(profile);
            try {
            const user = await userModel.findOne({
                $or: [
                { email: profile._json.html_url },
                { username: profile._json.login },
                ],
            });

            if (!user) {
                console.warn("The user does not exist in the database");
            } else {
                console.log("Validated user for login: " + user.username);
            }

            if (!user) {
                console.warn("A new user was created as " + profile._json.login);
                const newUser = {
                username: profile._json.login,
                email: profile._json.html_url,
                password: "gitHubUserPass",
                gitHubId: profile.id,
                loggedBy: "GitHub",
                rol: "user",
                };

                const result = await userModel.create(newUser);
                return done(null, result);
            } else {
                return done(null, user);
            }
            } catch (error) {
            return done(error);
            }
        }
        )
    );

    passport.use(
        "register",
        new localStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age } = req.body;
            try {
            const exist = await userModel.findOne({ email });
            if (exist) {
                console.log("User already exists!!");
                done(null, false);
            }
            const user = {
                first_name,
                last_name,
                email,
                age,
                passwordHash: createHash(password),
            };
            const result = await userModel.create(user);

            return done(null, result);
            } catch (error) {
            return done("Error registering user " + error);
            }
        }
        )
    );

    //Usando estrategia de Login con passport:
    passport.use(
        "login",
        new localStrategy(
        { passReqToCallback: true, usernameField: "email" },
        async (req, username, password, done) => {
            try {
            const user = await userModel.findOne({ email: username });
            console.log("Verifying user for login: ");
            //console.log(user.email);
            if (!user) {
                console.warn("User doesn't exist with username: " + username);
                return done(null, false);
            }
            if (!isValidPassword(user, password)) {
                console.warn("Invalid credentials for user: " + username);
                return done(null, false);
            }
            return done(null, user);
            } catch (error) {
            return done(error);
            }
        }
        )
    );

    //Funciones de Serializacion y Desserializacion
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
        let user = await userModel.findById(id);
        done(null, user);
        } catch (error) {
        console.error("Error deserializing user: " + error);
        }
    });
};

export default initializePassport;
