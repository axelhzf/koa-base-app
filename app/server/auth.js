var co = require("co");
var passport = require('koa-passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var thunkify = require("thunkify");
var Facebook = require('facebook-node-sdk');

var config = require("./config");
var User = require("./models/User");
var logger = require("./logger").child({"feature": "auth"});

var facebook = new Facebook({ appID: config.fb.clientId, secret: config.fb.clientSecret });
var fb = thunkify(facebook.api.bind(facebook));

exports.configure = configureAuth;
exports.ensureAuthenticated = ensureAuthenticated;

function configureAuth (app) {

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    co(function* () {
      var user = yield User.find(id);
      return user;
    })(done);
  });

  passport.use(new FacebookStrategy({
      clientID: config.fb.clientId,
      clientSecret: config.fb.clientSecret,
      callbackURL: config.fb.callbackUrl,
      profileFields: ['id', 'displayName'],
      scope: ['public_profile', 'email']
    },
    function (accessToken, refreshToken, profile, done) {
      co(function* () {

        var user = yield User.find({where: {fbId: profile.id}});

        if (user) {
          // refresh access token
          user.accessToken = accessToken;
          yield user.save();

          logger.info("Login existing user %s", user.id);

          return user;
        } else {
          var response = yield fb("/me", {fields: 'picture.type(large), email', access_token: accessToken});

          // create the user
          var userData = {
            fbId: profile.id,
            accessToken: accessToken,
            displayName: profile.displayName,
            photo: response.picture.data.url,
            email: response.email
          };
          user = yield User.create(userData);

          logger.info("New user log in %s", userData.email);

          return user;
        }
      })(done);
    }
  ));

  app.use(passport.initialize());
  app.use(passport.session());
}

exports.routes = {
  auth: passport.authenticate('facebook'),
  authCallback: passport.authenticate('facebook', {
    successReturnToOrRedirect: '/private',
    failureRedirect: '/'
  }),
  logout: function* () {
    this.logout();
    this.redirect("/");
  }
};


function* ensureAuthenticated (next) {
  if (this.isAuthenticated()) {
    yield next;
  } else {
    this.set('X-Auth-Required', 'true');
    this.redirect('/auth/facebook');
  }
}

