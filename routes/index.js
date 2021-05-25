var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Landing root Route
router.get("/", function(req, res){
   res.render("landing");
});


//=============================
//AUTH Routes
//=============================

//reg form
router.get("/register", function(req, res){
   res.render("register", {page: 'register'}); 
});

//handle sign up
router.post("/register", (req, res)=>{
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, (err, user)=>{
      if(err) {
         return res.render("register",{"info": err.message});
      }
      passport.authenticate("local")(req, res, ()=>{
         req.flash("success", "Sign up successful. welcome to Yelpcamp! " + user.username);
         res.redirect("/campgrounds");
      });
   });
});

//show login form
router.get("/login", function(req, res){
   res.render("login", {page: 'login'}); 
});

//handling login logic
router.post("/login", passport.authenticate("local",
   {
      successRedirect: "/campgrounds",
      failureRedirect: "/login",
      failureFlash : true,
      successFlash : "Welcome back!" 
   }), (req, res)=>{

});

//log out route
router.get("/logout", (req, res)=>{
   req.logout();
   req.flash("success", "Logged you out!");
   res.redirect("/campgrounds");
});


module.exports = router;