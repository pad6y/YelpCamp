var express = require("express");
var router = express.Router();

var Campground = require("../models/campground");
var middleware = require("../middleware");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//index route
router.get("/", (req, res) =>{
//Get all campgrounds from DB
   Campground.find({}, (err, allCampgrounds) =>{
   if(err) {
      console.log(err)
   } else {
      res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
   }
   });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
   // get data from form and add to campgrounds array
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
       id: req.user._id,
       username: req.user.username
   }
   geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     var lat = data[0].latitude;
     var lng = data[0].longitude;
     var location = data[0].formattedAddress;
     var newCampground = {name: name, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
     // Create a new campground and save to DB
     Campground.create(newCampground, function(err, newlyCreated){
         if(err){
             console.log(err);
         } else {
             //redirect back to campgrounds page
             //console.log(newlyCreated);
             res.redirect("/campgrounds");
         }
     });
   });
 });

//show form to create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("campgrounds/new");
});

//Show - show more info about selected campground
router.get("/:id", (req, res) => {
   
   //find the campgrounds with provided id
   Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) =>{
      if(err || !foundCampground){
         req.flash('error', 'Campground not found');
         res.redirect('back')
      }else {
         //render show template
         res.render("campgrounds/show", {campground: foundCampground});
      }
   });
});

//Edit campgrounds
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res)=>{
   Campground.findById(req.params.id, (err, foundCampground)=>{
      res.render("campgrounds/edit", {campground: foundCampground});     
   }); 
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   geocoder.geocode(req.body.location, function (err, data) {
     if (err || !data.length) {
       req.flash('error', 'Invalid address');
       return res.redirect('back');
     }
     req.body.campground.lat = data[0].latitude;
     req.body.campground.lng = data[0].longitude;
     req.body.campground.location = data[0].formattedAddress;
 
     Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
         if(err){
             req.flash("error", err.message);
             res.redirect("back");
         } else {
             req.flash("success","Successfully Updated!");
             res.redirect("/campgrounds/" + campground._id);
         }
     });
   });
 });

//Destroy campground route
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
   Campground.findByIdAndRemove(req.params.id, (err)=>{
      if(err){
         res.redirect("/campgrounds");
      } else {
         res.redirect("/campgrounds");
      }
   });
});



module.exports = router;