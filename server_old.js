let express  = require('express');
let app = express();

app.use(express.urlencoded({ extended: false }));

let session =  require('express-session');

let user = { username:'admin', password: '1234'};
let users = [];
users.push(user);


const logs = (req, res, next) => {
    console.log(req.sessionID);
    next();
  };

//app.use(logs);

// Start using session
app.use(session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false
    })
);
// Check if authorized
const check =  (req, res, next) => {
    if (req.session && req.session.iduser >= 0 ) {
        next();
    }
    else {
        res.send('Access denied');
    }
};



// Login and check user account, set session iduser
app.get('/login', logs, (req, res, next)=> {
    i= 0;
    users.forEach(user => {
        if (req.query.username == user.username && 
            req.query.password == user.password ) {
            req.session.iduser = i;
            res.send('login success')
        }
        i++;
    }); 
    if ( ! (req.session.iduser >=0) ) {
        res.send('not authorized');
    }
    }
);

// Logout and destroy session
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.send('logout success');
});


// Test redirect
app.get('/content', check ,function (req, res) {
    res.redirect("/content2");
});

// Get content endpoint
app.get('/content2', function (req, res) {
    console.log(req.session.iduser);
    res.render("content.ejs");
});

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

// Send login form
app.get('/login_form',(req, res) => {
    let username = "";
    if (req.cookies && req.cookies.username)
        username = req.cookies.username
        res.render('login_form.ejs', { 'username' : username });
});

// Redirect to home to content
app.get('/', (req, res) => {
    if (req.session.iduser >= 0) {
        res.redirect('/content');
    } else 
    res.redirect('/login_form');
});

let port = 8000;
app.listen(port , () => console.log('Server is running ' + port ));