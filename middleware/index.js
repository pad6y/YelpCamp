var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all middleware
var middlewareObj = {};


//campground ownership middleware
middlewareObj.checkCampgroundOwnership = function(req, res, next){
   //is user logged in
   if(req.isAuthenticated()){
      Campground.findById(req.params.id, (err, foundCampground)=>{
         if(err || !foundCampground){
            req.flash("info", "Campground not found!");
            res.redirect("back");
         } else {
            //does user own the campground
            if(foundCampground.author.id.equals(req.user._id)) {
               next();
            }else{
               req.flash("error", "Permission denied!");
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "You need to sign in to do that!");
      res.redirect("back");
   }
};

//comment ownership middleware
middlewareObj.checkCommentOwnership = function(req, res, next){
   //is user logged in
   if(req.isAuthenticated()){
      Comment.findById(req.params.comment_id, (err, foundComment)=>{
         if(err || !foundComment){
            req.flash("error", "Comment not found");
            res.redirect("back");
         } else {
            //does user own the comment
            if(foundComment.author.id.equals(req.user._id)) {
               next();
            }else{
               req.flash("info", "You dont have permission!");
               res.redirect("back");
            }
         }
      });
   } else {
      req.flash("error", "Please login!");
      res.redirect("back");
   }
};

//logged in middleware
middlewareObj.isLoggedIn = function(req, res, next){
   if(req.isAuthenticated()){
      return next();
   }
   req.flash("error", "You need to be signed in to do that!");
   res.redirect("/login");
};
module.exports = middlewareObj;