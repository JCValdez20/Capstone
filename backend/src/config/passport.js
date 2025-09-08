const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const User = require("../models/User");
const argon2 = require("argon2");

// Google Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (_, __, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const [first_name, last_name = "User"] = profile.displayName?.split(
          " "
        ) || ["Google"];

        const user = await User.findOneAndUpdate(
          { email },
          {
            $setOnInsert: {
              first_name,
              last_name,
              password: await argon2.hash(profile.id),
              roles: "customer",
              isGoogleUser: true,
              googleId: profile.id,
              isVerified: true, // Google users are automatically verified
            },
          },
          { upsert: true, new: true }
        );

        done(null, user);
      } catch (err) {
        done(err);
      }
    }
  )
);

// Note: Serialization/deserialization removed as we're using stateless JWT authentication
// No session management needed with JWT-only approach

module.exports = passport;
