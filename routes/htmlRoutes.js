var db = require("../models");
var passport = require("passport");

var myAuth = {
  domain: "dev-2skfboer.auth0.com",
  clientID: "XH0ev4x8vDpe1AjnFot0NFNgCOJFheCX",
  clientSecret:
    "_PxaQ2jJV4jFM_EWbxgttPfv_pH90Ds6QgwBUzsNTWNb4arw3q06jvr28AKJgTb0",
  callbackURL: "http://localhost:3000/callback"
};

module.exports = function(app) {
  // Load index page
  app.get("/", function(req, res) {
    db.Example.findAll({}).then(function(dbExamples) {
      res.render("index", {
        msg: "Welcome!",
        examples: dbExamples
      });
    });
  });

  // Load example page and pass in an example by id
  app.get("/example/:id", function(req, res) {
    db.Example.findOne({
      where: {
        id: req.params.id
      }
    }).then(function(dbExample) {
      res.render("example", {
        example: dbExample
      });
    });
  });

  app.get(
    "/login",
    passport.authenticate("auth0", {
      clientID: myAuth.clientID,
      domain: myAuth.domain,
      redirectUri: myAuth.callbackURL,
      responseType: "code",
      audience: "http://payeng/login/",
      scope: "openid profile"
    }),
    function(req, res) {
      res.redirect("/");
    }
  );

  app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/");
  });

  app.get(
    "/callback",
    passport.authenticate("auth0", {
      failureRedirect: "/failure"
    }),
    function(req, res) {
      res.redirect("/user");
    }
  );

  // Render 404 page for any unmatched routes
  app.get("*", function(req, res) {
    res.render("404");
  });
};
