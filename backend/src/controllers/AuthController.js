require("dotenv").config();
const send = require("../utils/Response");
const passport = require("passport");
const jwt = require("jsonwebtoken");

exports.loginSuccess = async (req, res) => {
  try {
    if (!req.user) throw new Error("No user found");

    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    const redirectUrl = `${clientUrl}/auth/callback/google?token=${token}&user=${encodeURIComponent(
      JSON.stringify({
        id: req.user._id,
        email: req.user.email,
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        name: req.user.name,
        roles: req.user.roles,
        hasProfilePic: !!req.user.profilePic, // Just indicate if user has a profile pic
        isGoogleUser: true,
      })
    )}`;

    res.redirect(redirectUrl);
  } catch (error) {
    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

exports.loginFailed = async (req, res) => {
  try {
    res.redirect(`${process.env.CLIENT_URL}?error=login_failed`);
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}?error=server_error`);
  }
};

exports.googleCallback = (req, res, next) => {
  passport.authenticate("google", {
    successRedirect: "/auth/login/success",
    failureRedirect: "/auth/login/failed",
  })(req, res, next);
};

exports.googleAuth = (req, res, next) => {
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
};

exports.googleLogout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.redirect(`${process.env.CLIENT_URL}?error=logout_failed`);
      }

      req.session.destroy((err) => {
        if (err) {
          // Silent error handling
        }

        res.clearCookie("connect.sid");

        res.redirect(process.env.CLIENT_URL);
      });
    });
  } catch (error) {
    res.redirect(`${process.env.CLIENT_URL}?error=logout_failed`);
  }
};
