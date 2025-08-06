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
        const profilePic = profile.photos?.[0]?.value || "";

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
              profilePic,
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

// Serialization
passport.serializeUser((user, done) => done(null, user._id));

// Updated deserialization without callback
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
