var co = require("co");
var config = require("./config");
var passport = require('koa-passport');
var User = require("./models/User");
var FacebookStrategy = require('passport-facebook').Strategy;
var thunkify = require("thunkify");


var Facebook = require('facebook-node-sdk');
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
    successReturnToOrRedirect: '/contest/user',
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

