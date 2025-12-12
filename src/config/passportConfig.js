import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/users.js";
import bcrypt from "bcryptjs";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }).exec();
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
