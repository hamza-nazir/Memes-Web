const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local');
const User = require('../model/user');

passport.use(new LocalStrategy(User.authenticate()));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BACK_END}/auth/google/callback`
},
async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;

    let user = await User.findOne({ googleId: profile.id });
    if (user) return done(null, user);

    user = await User.findOne({ email: email });
    if (user) {
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }

    user = await User.create({
      googleId: profile.id,
      username: email.split('@')[0],
      fullName: profile.displayName,
      email: email
    });

    return done(null, user);

  } catch (err) {
    return done(err, null);
  }
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = passport;