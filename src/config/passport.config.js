import passport from "passport";
import LocalStrategy from "passport-local";
import bcrypt from "bcrypt";
import userModel from "./dao/models/user.model.js";

passport.use(
    new LocalStrategy.Strategy(async (email, password, done) => {
        try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return done(null, false, { message: "Incorrect email." });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordValid) {
            return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
        } catch (error) {
        return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});
