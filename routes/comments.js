//Express router export
var express = require("express");
var router = express.Router({mergeParams: true});

var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");

//coments new

router.get("/new", middleware.isLoggedIn, (req, res)=>{
   Campground.findById(req.params.id, (err, campFound) =>{
      if(err) {
         console.log(err);
      } else {
         res.render("comments/new", {campground: campFound});
      }
   });
});

//comments create
router.post("/", middleware.isLoggedIn, (req, res)=> {

   Campground.findById(req.params.id, (err, campground)=> {
      if(err) {
         console.log(err);
         res.redirect("/campgrounds");
      } else {
         Comment.create(req.body.comment, function(err, comment){
            if(err) {
               req.flash("error", "Failed to leave comment!");
               console.log(err)
            } else {
               //add username and id to comments
               comment.author.id = req.user._id;
               comment.author.username = req.user.username;
               //save comment
               comment.save();
               campground.comments.push(comment);
               campground.save();
               req.flash("success", "Review successfully posted!!");
               res.redirect("/campgrounds/" + campground._id);
            }
         });
      }
   });
});

//Edit comments route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
   Campground.findById(req.params.id, function(err, foundCampground){
      if(err || !foundCampground){
         req.flash("error", "Campground not found!");
         return res.redirect("back");
      }
      Comment.findById(req.params.comment_id, (err, foundComment)=>{
         if(err){
            res.redirect("back");
         }else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
         }
      });
   });
   
});

//Comments update
router.put("/:comment_id", middleware.checkCommentOwnership, (req, res) =>{
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComments)=> {
      if(err) {
         req.flash("error", "Failed to edit comment!");
         res.redirect("back");
      }else {
         req.flash("info", "Successfully edited comment!");
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});

//Destroy comment route
router.delete("/:comment_id", (req, res)=>{
   //findByIDandRemove
   Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
      if(err){
         req.flash("error", "Fail to remove review!");
         res.redirect("back");
      }else {
         req.flash("success", "review successfully removed!");
         res.redirect("/campgrounds/" + req.params.id);
      }
   });
});




module.exports = router;