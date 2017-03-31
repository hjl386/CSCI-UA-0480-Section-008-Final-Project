//App.js

const express = require('express');
const session = require('express-session');
const app = express();
const [PORT, HOST] = [3000, '127.0.0.1'];
const bodyParser = require('body-parser');

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

require('./db');
const mongoose = require('mongoose');
//const Comment = mongoose.model('Comment');
const User = mongoose.model('User');

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

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/:slug', (req, res) => {
	User.find({}, (err, users) => {
		if(err){
			console.log(err);
		}
		res.render('profile', {users: users});	
	});
});

app.post('/:slug', (req, res) => {
	const u = new User({
		username: req.body.username,
		//password: req.body.password, //hashed value
		email: req.body.email,
		hasSwipes: req.body.hasSwipes,
		title: req.body.title,
		matches: req.body.matches,
		reviews: req.body.reviews,
		critiques: req.body.critiques
	});
	u.save((err) => {
		if(err){
			console.log(err);
		}
		res.redirect('/profile');
	});
});

app.listen(PORT, HOST);
