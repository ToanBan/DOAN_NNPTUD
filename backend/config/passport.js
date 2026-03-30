const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../schemas/users");
const Role = require("../schemas/roles");

const hasGoogleOAuthConfig =
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_REDIRECT_URI;

if (hasGoogleOAuthConfig) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URI,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;

          let user = await User.findOne({ email });

          if (!user) {
            const userRole = await Role.findOne({ name: "user" });

            user = new User({
              username: profile.displayName.replace(/\s/g, "").toLowerCase(),
              email,
              fullName: profile.displayName,
              password: "google_oauth", // dummy
              role: userRole._id,
              status: true,
            });

            await user.save();
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn("Google OAuth is disabled: missing GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URI");
}

module.exports = passport;