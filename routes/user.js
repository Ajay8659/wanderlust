const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAscync.js");
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");


router.get("/signup", (req, res) => {
  res.render("user/signup.ejs");
});

//Signup Route
router.post(
  "/signup",
  wrapAsync(async (req, res, next) => {
    console.log(req.file); // Check if the file is being uploaded correctly
    try {
      const { username, email, password } = req.body;
      const newUser = new User({
        email,
        username
      });
      const registeredUser = await User.register(newUser, password);
      // Automatically log in the user after registration
      req.login(registeredUser, (err) => {
        if (err) {
          return next(err);
        }
        req.flash(
          "success",
          `Welcome to Wanderlust ${registeredUser.username}!`
        );
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      return res.redirect("/signup");
    }
  })
);
// Login Route
router.get("/login", (req, res) => {
  res.render("user/login.ejs");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    req.flash("success", `Welcome back ${req.user.username}!`);
    return res.redirect(res.locals.redirectUrl || "/listings");
  }
);

//logout route
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are Logged out!");
    res.redirect("/listings");
  });
});

module.exports = router;
