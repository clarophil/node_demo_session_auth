let express  = require('express');
let app = express();

// Import Body parser
let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

let session =  require('express-session');

let user = { username:'admin', password: '1234'};
let users = [];
users.push(user);

// Check login and password
let check = function(req, res, next) {
    console.log(req.session);
    if (req.session && req.session.auth )
      return next();
    else
      return res.status(401).send("Access denied !  <a href='/login_form'>Login</a>"); 
};

// Start using session
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
    })
);

// Send register form
app.get('/register_form',(req, res) => {
    res.render('register.ejs');
} );

// Save new account
app.post('/register_save', (req, res) => {
    console.log(req.body);
    let user = { username: req.body.username, password: req.body.password };
    users.push(user);
    console.log(users);
    res.send('user created !   <a href="/content">Goto content</a> ');
});

// Update user
app.put('/user/:iduser', (req, res) => {
    let user = { username: req.body.username, password: req.body.password  };
    users[req.params.iduser] =  user;
    res.send('user updated'); 
});

// Delete user
app.delete('/user/:iduser', (req, res) => {
    users.splice(req.params.iduser,1);
    console.log(users);
    res.send('user delete'); 
});

// Login and check user account
app.get('/login', function (req, res) {
    users.forEach(user => { 
        if(req.query.username === user.username && req.query.password === user.password ) {
            req.session.auth = true;
            res.cookie('username',req.query.username);
            res.send("login success!  <a href='/content'>Goto content</a> ");
        }
    });
    if (! req.session.auth ) {
        res.send("Login failed ! <a href='/login_form'>Try again</a> ");
    };
  });

// Send login form
app.get('/login_form',(req, res) => {
    let username = "";
    if (req.cookies && req.cookies.username)
        username = req.cookies.username
    console.log(username);
        res.render('login_form.ejs', { 'username' : username });
});

// Redirect to home to content
app.get('/', (req, res) => {
    if (req.session.auth) {
        res.redirect('/content');
    } else 
    res.redirect('/login_form');
});

// Logout and destroy session
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send("Logout success! ");
    });

// Get content endpoint
app.get('/content', check, function (req, res) {
    console.log(req.sessionID);
    res.send("You can only see this after you've logged in.<br> <a href='/logout'>Logout</a> ");
});


let port = 8000;
app.listen(port , () => console.log('Server is running ' + port ));