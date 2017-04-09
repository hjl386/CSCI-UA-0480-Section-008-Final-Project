//App.js

const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('./db');

const PORT = 3000;
const app = express();
const User = mongoose.model('User');
const Login = mongoose.model('Login');
const saltRounds = 10; 

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const sessionOptions = {
	secret: 'secret kitchen thang',
	resave: true,
	saveUninitialized: true
};

app.use(session(sessionOptions));

app.get('/css/base.css', (req, res) => {
	res.render('base.css');
});

/* Middleware
const regOrLog = function(req, res, next){
	if 	
	next();
}

app.use(regOrLog);
*/
/* AJAX Fail
Check index.html for onsubmit on buttons 
function setReg(){
	console.log("REGISTERED");
	return regBool = true;
}

function setLog(){
	console.log("LOGGED IN");
	return logBool = true;
}
*/

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/', (req, res) => {
	if(req.body.regUsername){
		console.log("REGBOOL");		//TEST CODE
		if(req.body.regPassword.length < 8){
			res.render('index', {passwordLength: true});
		} else{
			Login.findOne({username: req.body.regUsername}, (err, login) => {
				if(err) {
					console.log(err);
				} else if(login){
					res.render('index', {loginExists: true});
				} else{
					bcrypt.hash(req.body.regPassword, saltRounds, (err, hash) => { 
						if(err){
							console.log(err);
						}
						const loginHash = new Login({
							username: req.body.regUsername,
							password: hash
						});
						loginHash.save(err => {
							if(err){
								console.log(err);
							}
							req.session.regenerate(err => {
								if(!err){
									req.session.username = loginHash.username;
									res.redirect('/userHome');
								} else {
									console.log(err);
									res.send('An error has occured, see the server logs for more information');
								}
							});		
						});
					});
				}
			});
		}
	} else if(req.body.logUsername){
		console.log("LOGBOOL");		//TEST CODE
		Login.findOne({username: req.body.logUsername}, (err, login) => {
			if(err){
				console.log(err);
				res.send('An error has occured, see the server logs for more information');
			} else if(!err && login){
				bcrypt.compare(req.body.logPassword, login.password, (err, passwordMatch) => {
					if(passwordMatch){
						req.session.regenerate(err => {
							if(!err){
								req.session.username = login.username;
								res.redirect('/userHome');
							} else {
								console.log(err);
								res.send('An error has occured, see the server logs for more information');	
							}		
						});
					} else {
						res.render('index', {fail: true});
					}
				});			
			} else{
				res.render('index', {loginNotExists: true});
			}
		});
	} else{
		res.render('index');
	}
});

app.get('/userHome', (req, res) => {
	console.log(req.session.username);	//TEST CODE
	res.render('userHome', {username: req.session.username});
});

/*
app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res) => {
	Login.findOne({username: req.body.username}, (err, login) => {
		if(err){
			console.log(err);
			res.send('An error has occured, see the server logs for more information');
		} else if(!err && login){
			bcrypt.compare(req.body.password, login.password, (err, passwordMatch) => {
				if(passwordMatch){
					req.session.regenerate(err => {
						if(!err){
							req.session.username = login.username;
							res.redirect('/');
						} else {
							console.log(err);
							res.send('An error has occured, see the server logs for more information');	
						}		
					});
				} else {
					res.render('login', {fail: true});
				}
			});			
		} else{
			res.render('login', {loginNotExists: true});
		}
	});
});
*/
app.get('/logout', (req, res) => {
	req.session.destroy(err => {
		if(err){
			console.log(err);
		} else{
			res.redirect('/');
		}
	});	
});

app.get('/profile', (req, res) => {
	User.find({}, (err, users) => {
		if(err){
			console.log(err);
		}
		res.render('people', {users: users});
	});
});

app.post('/profile', (req, res) => {
	const user = new User({
		username: req.body.username,
		email: req.body.email,
		hasSwipes: req.body.hasSwipes,
		title: req.body.title,
		matches: req.body.matches,
		reviews: req.body.reviews, 
		critiques: req.body.critiques
	});
	user.save((err) => {
		if(err){
			console.log(err);
		} else{
			res.redirect('/profile');
		}
	});
});

app.get('/:slug', (req, res) => {
	User.find({slug: req.params.slug}, (err, users) => {
		if(err){
			console.log(err);
		}
		res.render('profile', {users: users});	
	});
});

app.post('/:slug', (req, res) => {
	User.findOneAndUpdate({slug: req.params.slug}, {$push: {matches: {username: req.body.username, hasSwipes: req.body.hasSwipes, title: req.body.title}, reviews: {username: req.body.username, comments: req.body.comments, rating: req.body.rating}, critiques: {username: req.body.username, comments: req.body.comments, rating: req.body.rating}}}, (err) => {
		if(err){
			console.log(err);
		} else {
			res.redirect(req.params.slug);
		}
	});
});

app.listen(process.env.PORT || PORT);
