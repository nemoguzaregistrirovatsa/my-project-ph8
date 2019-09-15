'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var session     = require('express-session');
var ejs         = require('ejs');

var apiRoutes   = require('./routes/api.js');

//var masonry = require('masonry');

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.engine('html', ejs.renderFile);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true, cookie: { maxAge: 1000 * 60 * 10 }}));


/*app.use(new LocalStrategy(
  function(username, password, done) {
    console.log(username);
    return done();
  }
));*/

//passport.serializeUser((user, done) => {
//  done(null, user.id);
//});

//Routing for API 
apiRoutes(app);
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
});