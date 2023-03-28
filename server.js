let express  = require('express');
let app = express();

app.use(express.urlencoded({ extended: true }));

let session =  require('express-session');

let user = { username:'admin', password: '1234'};
let users = [];
users.push(user);

// Check login and password
let check = function(req, res, next) {
    console.log(req.session.username);
    if (req.session && req.session.username )
    {
        users.forEach(user => {
            console.log(req.session.username);
            if (user.username == req.session.username) return next();
        });
    }

    return res.status(401).send("Access denied !  <a href='/login_form'>Login</a>"); 
};

// Start using session
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
    })
);

const logs = (req, res, next) => {
    console.log(req.sessionID);
    next();
  };


// Send register form
app.get('/register_form',(req, res) => {
    res.render('register.ejs');
} );

// Save new account
app.post('/register_save', (req, res) => {
    let user = { username: req.body.username, password: req.body.password };
    users.push(user);
    console.log(users);
    req.session.username = req.body.username;
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

// Login and check user account, set session iduser and cookie username
app.get('/login',  function (req, res) {
    i = 0;
    users.forEach(user => { 
        console.log(user);
        if(req.query.username == user.username && req.query.password == user.password ) {
            req.session.username = req.query.username;
            res.send("login success!  <a href='/content'>Goto content</a> ");
        }
    });
    console.log(req.session.username);
    if ( ! req.session.username ) {
        res.send("Login failed ! <a href='/login_form'>Try again</a> ");
    }
  });

// Send login form
app.get('/login_form',(req, res) => {
    let username = "";
    if (req.cookies && req.cookies.username)
        username = req.cookies.username
        res.render('login_form.ejs', { 'username' : username });
});

// Redirect to home to content
app.get('/', logs, (req, res) => {
    if (req.session.iduser >= 0) {
        res.redirect('/content');
    } else 
    res.redirect('/login_form');
});

// Logout and destroy session
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie('username');
    res.send("Logout success! <a href='/'>Login</a> ");
    });

// Get content endpoint
app.get('/content', check, function (req, res) {
    res.send("You can only see this after you've logged in.<br> <a href='/logout'>Logout</a> ");
});

let port = 8000;
app.listen(port , () => console.log('Server is running ' + port ));