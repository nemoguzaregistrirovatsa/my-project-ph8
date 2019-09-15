'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var passport    = require('passport');
var LocalStrategy = require('passport-local');

module.exports = function (app) {
  
  mongoose.connect(process.env.DB, { useNewUrlParser: true });

  const SchemaPH8 = new mongoose.Schema({
      username: String,
      password: String,
      links: [String]
    });
  const ModelPH8 = mongoose.model('ModelPH8', SchemaPH8);
  
  /*ModelPH8.remove({}, (err) => {
    if (err) console.log('Error reading database!')
  });*/
  
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
     done(null, user._id);
   });

  passport.deserializeUser((id, done) => {
    ModelPH8.findOne(
      {_id: id},
      (err, data) => {
        done(null, data);
      }
    );
  });
  
  passport.use(new LocalStrategy(
    function(username, password, done) {
      ModelPH8.findOne({username: username}, function (err, data) {
        if (err) { return done(err); }
        if (!data) { return done(null, false); }
        if (!bcrypt.compareSync(password, data.password)) { return done(null, false); }
        return done(null, data);
      });
    }
  ));
  
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    };
    res.redirect('/login');
  };

  app.route('/login')
    .get(function (req, res) {
      res.render(process.cwd() + '/views/login.html');
    })

    .post(passport.authenticate('local', { failureRedirect: '/signup' }), function (req, res) {
      res.redirect('/');
    
      /*ModelPH8.findOne({username: req.body.username}, (err, data) => {
        if (err) console.log('Error reading database!')
        else {
          if (data){
            console.log('Log in successful!');
            req.session.username = req.body.username;
            res.redirect('/');
          } else {
            console.log('User doesn\'t exist!');
            res.redirect('/login');
          };
        };
      });*/
    
    });

  app.route('/')
    .get(ensureAuthenticated, function (req, res) {
      
    
      //if (req.session.username) {
        var images = '';
        ModelPH8.find({}, (err, data) => {
          if (err) console.log('Error reading database!')
          else {
            data.forEach(e => {
              e.links.forEach(f => {
                images += '<div class="image"><div class="imageBorder"><img src="' + f + '"><a class="users" href="' + process.cwd().replace(/app/, "") + e.id + '">@' + e.username + '</a></div></div>';
              })
            });
          };
          res.render(process.cwd() + '/views/index.html', {images: images});
        });
      /*} else {
        res.redirect('/login');
      }*/
    
    });

  app.route('/logout')
    .post(function (req, res) {
      req.logout();
      
    //delete req.session.username;
    
      res.redirect('/login');
    });

  app.route('/signup')
    .get(function (req, res) {
      res.render(process.cwd() + '/views/signup.html');
    })

    .post(function (req, res) {
      ModelPH8.findOne({username: req.body.username}, (err, data) => {
        if (err) console.log('Error reading database!')
        else {
          if (data){
            console.log('Username exists!')
            res.redirect('/signup');
          } else {
            var user = new ModelPH8({
              username: req.body.username,
              password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
              links: []
            });
            user.save((err) => {
              if (err) console.log('Error saving to database!')
              else {
                console.log('Success saving to database!');
                res.redirect('/login');
              };
            });
          };
        };
      });
    });

  app.route('/upload')
  .post(ensureAuthenticated, function (req, res) {
    //if (req.session.username) {
        res.render(process.cwd() + '/views/upload.html');
      /*} else {
        res.redirect('/login');
      }*/
  });

  app.route('/update')
  .post(ensureAuthenticated, function (req, res) {
    //if (req.session.username) {
        ModelPH8.findOne({username: req.user.username}, (err, data) => {
          if (err) console.log('Error reading database!')
          else {
            data.links.push(req.body.link);
            data.save(err => {
              if (err) console.log('Error saving to database!')
              else console.log('Successful saving to database!');
            });
          };
        });
        res.redirect('/');
      /*} else {
        res.redirect('/login');
      }*/
  });

  app.route('/mywall')
  .post(ensureAuthenticated, function (req, res) {
    //if (req.session.username) {
      console.log(req.user);
      res.redirect('/' + req.user._id);
      /*ModelPH8.findOne({username: req.session.username}, (err, data) => {
        if (err) console.log('Error reading database!')
        else res.redirect('/' + data.id);
      });
    } else {
      res.redirect('/login');
    }*/
  });

  app.route('/:id')
    .get(ensureAuthenticated, function (req, res) {
      //if (req.session.username) {
        var images = '';
        var del = '';
    
        ModelPH8.findOne({_id: req.params.id}, (err, data) => {
          if (err) console.log('Error reading database!')
          else {

            data.links.forEach((f, i) => {
              if (data.id == req.user._id) del = '<form action="/' + req.user._id + '?link=' + i + '" method="post" class="deleteForm"><input type="submit" value="X" class="submit delete"></form>';
              images += '<div class="image"><div class="imageBorder"><img src="' + f + '"><a class="users" href="' + process.cwd().replace(/app/, "") + data._id + '">@' + data.username + '</a>' + del + '</div></div>';
              del = '';
            });
          };
          res.render(process.cwd() + '/views/wall.html', {images: images});
        });
      /*} else {
        res.redirect('/login');
      }*/
    })

    .post(ensureAuthenticated, function(req, res) {
      /*if (req.session.username) {*/
        ModelPH8.findOne({_id: req.params.id}, (err, data) => {
          if (err) console.log('Error reading database!')
          else {
            data.links.splice(req.query.link, 1);
            console.log(data.links);
            data.save((err) => {
              if (err) console.log('Error saving to database!')
              else {
                console.log('Success saving to database!');
                res.redirect('/' + data._id);
              };
            })
          }
        })
      /*} else {
        res.redirect('/login');
      }*/
    });
  
}; // 'module.exports'