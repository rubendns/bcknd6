import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import userModel from '../dao/models/user.model.js';

passport.use(
  'local-register',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const exist = await userModel.findOne({ email });

        if (exist) {
          return done(null, false, { message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = {
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email,
          age: req.body.age,
          password: hashedPassword,
        };

        const result = await userModel.create(user);
        return done(null, result);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
          return done(null, {
            name: 'Admin',
            email: 'adminCoder@coder.com',
            rol: 'admin',
            age: 0,
          });
        }

        const user = await userModel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          return done(null, false, { message: 'Incorrect credentials' });
        }

        return done(null, {
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          rol: 'user',
          age: user.age,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await userModel.findOne({ email });
    done(null, user);
  } catch (error) {
    done(error);
  }
});
