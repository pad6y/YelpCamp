//mongod --config /usr/local/etc/mongod.conf
require("dotenv").config();

var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocatStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  // Campground = require("./models/campground"),
  // Comment = require("./models/comment"),
  User = require("./models/user");
// seedDB = require("./seeds");

//requiring modulised routes files
var campgroundRoutes = require("./routes/campgrounds"),
  commentRoutes = require("./routes/comments"),
  authRoutes = require("./routes/index");

//mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose.connect("mongodb://localhost:27017/yelp_camp", options);
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

//Passport config
app.use(
  require("express-session")({
    secret: "frankie is the cutest dog ever!",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocatStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passing user variable to all routes
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.info = req.flash("info");
  next();
});

//using the routes
app.use(authRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(3000, () => {
  console.log("The YelpCamp v13 googlemap version server has started");
});
