//App.js

const express = require('express');
const session = require('express-session');
const fs = require('fs');
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
									res.redirect('/makeProfile');
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

app.get('/userHome', (req, res) => {  //NEED TO ADD REST OF THE FEATURES 
	console.log(req.session.username);	//TEST CODE
	User.find((err, users) => {
		if(err){
			console.log(err);
		}
		const people = users.filter(ele => {
			return (ele.username !== req.session.username);
		});
		console.log(people);
		res.render('userHome', {username: req.session.username, people: people});
	});
});

app.get('/logout', (req, res) => {
	req.session.destroy(err => {
		if(err){
			console.log(err);
		} else{
			res.redirect('/');
		}
	});	
});

app.get('/makeProfile', (req, res) => {
		res.render('makeProfile');
});

app.post('/makeProfile', (req, res) => {
	console.log('req.body.swipes ', req.body.swipes);		//TEST CODE
	const user = new User({
		username: req.session.username,
		email: req.body.email,
		hasSwipes: req.body.swipes,
		nickname: req.body.nickname,
		bio: req.body.bio,
		matches: req.body.matches,
		reviews: req.body.reviews, 
		critiques: req.body.critiques
	});
	user.save((err) => {
		if(err){
			console.log(err);
		} else{
			req.session.email = user.email;
			console.log("SAVING");
			res.redirect('/userHome');
		}
	});
});

app.get('/editProfile', (req, res) => {
	User.find({}, (err, users) => {
		if(err){
			console.log(err);
		}
		res.render('editProfile', {users: users});
	});
});

app.post('/editProfile', (req, res) => {
	User.findOneAndUpdate({username: req.session.username}, {$set: {email: req.body.email, nickname: req.body.nickname, bio: req.body.bio, hasSwipes: req.body.swipes}}, (err) => {
		if(err) {
			console.log(err);
		} else {
			res.redirect('/userHome');
		}
	});
});

app.get('/todaysMatches', (req, res) => {
	res.render('todaysMatches');
});

app.get('/:slug', (req, res) => {
	User.findOne({nickname: req.params.slug}, (err, nn) => {
		if(err){
			console.log(err);
		}else if(nn){
			res.render('display', {nick: nn.nickname, nn: nn});
		}else{
			res.redirect('/userHome');
		}
	});
});
/*
app.post('/:slug', (req, res) -> {
	
});
*/
app.get('/:slug', (req, res) => {
	User.findOne({username: req.params.slug}, (err, users) => {
		if(err){
			console.log(err);
		}else if(users){
			if(users.matches.length > 0){
				const m = [...users.matches];
			}else{
				const m = "No Matches";
			}
			if(users.reviews.length > 0){
				const r = [...users.reviews];
			}else{
				const r = "No Reviews";
			}
			if(users.critiques.length > 0){
				const c = [...users.critiques];
			}else{
				const c = "No Critiques";
			}
			res.render('profile', {users: users, m: m, r: r, c: c});	
		}else {
			res.redirect('/');
		}
	});
});

app.post('/:slug', (req, res) => {
	User.findOneAndUpdate({slug: req.params.slug}, {$push: {matches: {username: req.body.username, hasSwipes: req.body.hasSwipes, nickname: req.body.nickname}, reviews: {username: req.body.username, comments: req.body.comments, rating: req.body.rating}, critiques: {username: req.body.username, comments: req.body.comments, rating: req.body.rating}}}, (err) => {
		if(err){
			console.log(err);
		} else {
			res.redirect(req.params.slug);
		}
	});
});

app.listen(process.env.PORT || PORT);
