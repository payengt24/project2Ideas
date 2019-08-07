require("dotenv").config();
var express = require("express");
var exphbs = require("express-handlebars");
var socket = require("socket.io");
var session = require("express-session");
var passport = require("passport");
var Auth0Strategy = require("passport-auth0");

var strategy = new Auth0Strategy(
  {
    domain: "dev-2skfboer.auth0.com",
    clientID: "XH0ev4x8vDpe1AjnFot0NFNgCOJFheCX",
    clientSecret:
      "_PxaQ2jJV4jFM_EWbxgttPfv_pH90Ds6QgwBUzsNTWNb4arw3q06jvr28AKJgTb0",
    callbackURL: "http://localhost:3000/callback"
  },
  function(accessToken, refresshToken, extraParam, profile, done) {
    return done(null, profile);
  }
);

passport.use(strategy);
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

var db = require("./models");

var app = express();
var PORT = process.env.PORT || 3000;

// Middleware
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(express.json());
app.use(express.static("public"));
app.use(
  session({
    secret: "your secret key",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.loggedIn = false;
  if (
    req.session.passport &&
    typeof req.session.passport.user !== "undefined"
  ) {
    res.locals.loggedIn = true;
  }
  next();
});

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// Routes
require("./routes/apiRoutes")(app);
require("./routes/htmlRoutes")(app);

var syncOptions = {
  force: false
};

// If running a test, set syncOptions.force to true
// clearing the `testdb`
if (process.env.NODE_ENV === "test") {
  syncOptions.force = true;
}

// Starting the server, syncing our models ------------------------------------/

db.sequelize.sync(syncOptions).then(function() {
  var server = app.listen(PORT, function() {
    console.log(
      "==> 🌎  Listening on port %s. Visit http://localhost:%s/ in your browser.",
      PORT,
      PORT
    );
  });
  var io = socket(server);

  io.on("connection", function(socket) {
    console.log("made socket connection", socket.id);
    socket.on("chat", function(data) {
      io.sockets.emit("chat", data);
    });
    socket.on("typing", function(data) {
      socket.broadcast.emit("typing", data);
    });
  });
});

module.exports = app;
