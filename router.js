//Router.js

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
//const Login = mongoose.model('Login');
const saltRounds = 10;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const sessionOptions = {
	secret: 'secret message', 
	resave: true,
	saveUninitialized: true
};

app.use(session(sessionOptions));

app.get('/stylesheets/stylesheet.css', (req, res) => {
	res.render('stylesheet.css');
});

app.get('/', (req, res) => {
	res.render('index');
});

app.post('/', (req, res) => {
	//console.log('Entered this stage');        // Test
	if(req.body.username){
		User.findOne({username: req.body.username}, (err, user) => {
			if(err){
				console.log(err);
				res.send('An error has occured, see the server logs for more information');
			} else if(!err && user){
				bcrypt.compare(req.body.password, user.password, (err, passwordMatch) => {
					if(err){
						console.log(err);
					} else if(passwordMatch){
						req.session.regenerate(err => {
							if(!err){
								req.session.username = user.username;
								req.session.email = user.email;
								req.session.swipes = user.swipes;
								req.session.description = user.description;
								//res.redirect(req.params.slug);		//Users Home Page
								res.redirect('/home');
							} else{
								console.log(err);
								res.send('An error has occured, see the server logs for more information');
							}
						});
					} else{
						res.render('index', {loginFail: true});
					}
				});	
			} else{
				res.render('index', {userDoesNotExist: true});
			}
		});	
	} else if(req.body.usernameR){
		//console.log('Register Username', req.body.usernameR);     // Test
		if(req.body.passwordR.length < 8){
			res.render('index', {passwordTooShort: true});
		} else{	//Implement check for lowercase and uppercase
			User.findOne({username: req.body.usernameR}, (err, user) => {
				if(err){
					console.log(err);
				} else if(!err && user){
					res.render('index', {userExistsAlready: true});
				} else{
					if(req.body.passwordR === req.body.confirmpassword){
						bcrypt.hash(req.body.passwordR, saltRounds, (err, hash) => {
							if(err){
								console.log(err);
							} else{
								const registerHash = new User({
									email: req.body.email,
									firstname: req.body.firstname,
									lastname: req.body.lastname,
									username: req.body.usernameR,
									password: hash,
									confirmpassword: hash,
									swipes: req.body.swipes,
									description: req.body.description
								});
								registerHash.save(err => {
									if(err){
										console.log(err);
									}
									req.session.regenerate(err => {
										if(!err){
											//console.log('REGENERATE SLUG');       // Test
											req.session.username = registerHash.username;
											req.session.email = registerHash.email;
											req.session.swipes = registerHash.swipes;
											req.session.description = registerHash.description;
											//res.redirect(req.params.slug);
											res.redirect('/home');
										} else{
											console.log(err);
											res.send('An error has occured, see the server logs for more information');
										}		
									});						
								});
							}
						});
					} else{
						res.render('index', {passwordDidNotMatch: true});
					}
				}
			});	
		}
	} else{
		res.render('index');
	}
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

app.get('/about', (req, res) => {
	res.render('about');
});

app.get('/map', (req, res) => {
	res.render('map');
});

app.get('/contact', (req, res) => {
	res.render('contact');
});

app.get('/home', (req, res) => {
	if(req.session.username === undefined){
		res.redirect('/');
	} else{
		User.find((err, users) => {
			if(err){
				console.log(err);
			} else{
				const otherUsers = users.filter(ele => {
					return (ele.username !== req.session.username);
				});
				//console.log(otherUsers);		// TEST
				res.render('home', {username: req.session.username, otherUsers: otherUsers});
			}
		});	
	}
});

app.get('/profile', (req, res) => {
	if(req.session.username === undefined){
		res.redirect('/');
	} else{
		User.findOne({username: req.session.username}, (err, user) => {
			if(err){
				console.log(err);
			} else if(user){
				res.render('profile', {userInfo: user});	
			} else{
				res.redirect('/'); 		//Redundant Testing to see if the person is logged in or not
			}
		});
	}
});

app.post('/profile', (req, res) => {
	let newEmail = '';
	let newSwipes = false;
	let newDescription = '';
	if(req.body.email){
		newEmail = req.body.email;
		req.session.email = newEmail;
	} else{
		newEmail = req.session.email; 
	}
	if(req.body.swipes){
		newSwipes = req.body.swipes;
		req.session.swipes = newSwipes;
	} else{
		newSwipes = req.session.swipes;
	}
	if(req.body.description){
		newDescription = req.body.description;
		req.session.description = newDescription;
	} else{
		newDescription = req.session.description;
	}
	User.findOneAndUpdate({username: req.session.username}, {$set: {email: newEmail, swipes: newSwipes, description: newDescription}}, (err) => {
		if(err){
			console.log(err);
		} else{
			res.redirect('/home');
		}
	});
});

app.get('/todaysMatches', (req, res) => {
    if(req.session.username === undefined){
        res.redirect('/');
    } else{
        if(req.query.yesOrNo === undefined){
            User.find({username: {$ne: req.session.username}}, (err, matches) => {
                if(err){
                    console.log(err);
                } else if(matches.length === 0){
                    console.log('No new matches');      //No Searches For Now
                } else{
                    // console.log('FOUND SOME MATCHES');      // Test
                    res.render('todaysMatches', {matches: matches});
                }
            });
        } else if(req.query.yesOrNo === 'yes'){
            console.log('REQ YES', req.query.yesOrNo);
            console.log('REQ YES BODY', req.body.username);
            User.findOneAndUpdate({username: {$eq: req.session.username}}, {$push: {liked: {userLike: req.body.username}}}, (err, like) => {
                if(err){
                    console.log(err);
                } else if(like){
                    User.find({username: {$ne: req.session.username}}, (err, matches) => {
                        if(err){
                            console.log(err);
                        } else if(matches){
                            const notMatchedYet = matches.filter(ele => {
                                return (ele.username !== req.body.username);
                            });
                            console.log('NOT MATCHED YET YES', notMatchedYet);
                            res.render('todaysMatches',{notMatchedYet: notMatchedYet});
                        }
                    });
                }
            });
        } else if(req.query.yesOrNo === 'no'){
            console.log('REQ NO', req.query.yesOrNo);
            console.log('REQ NO BODY', req.body.username);
            User.findOneAndUpdate({username: {$eq: req.session.username}}, {$push: {disliked: {userDislike: req.body.username}}}, (err, dislike) => {
                if(err){
                    console.log(err);
                } else if(dislike){
                    User.find({username: {$ne: req.session.username}}, (err, matches) => {
                        if(err){
                            console.log(err);
                        } else if(matches){
                            const notMatchedYet = matches.filter(ele => {
                                return(ele.username !== req.body.username);
                            });
                            console.log('NOT MATCHED YET NO', notMatchedYet);
                            res.render('todaysMatches', {notMatchedYet: notMatchedYet});
                        }
                    });
                }
            });
        }
    }
});
/*
app.get('/api/todaysMatches', (req, res) => {
    if(
    User.findOne({username: {$eq: req.body.username}}, (err, match) => {
        User.findOneAndUpdate({username: {$eq: req.session.username}}, {$push: {liked: match}}, (err) => {
            if(err){
                console.log(err);
            } else{
                res.json(matches);
            }
        });
    });
});
*/

app.post('/api/todaysMatches', (req, res) => {
//    console.log('REQ', req.body.username);
    User.findOne({username: {$eq: req.body.username}}, (err, match) => {
        if(err){
            console.log(err);
        } else if(match === null){
            console.log('/api/todaysMatches post Nothing was found');
        } else{
            res.json(match);
        }
    });
});

app.get('/reviews', (req, res) => {
    if(req.session.username === undefined){
        res.redirect('/');
    } else{
        User.findOne({username: {$eq: req.session.username}}, (err, userReview) => {
            if(err){
                console.log(err);
            } else if(userReview){
                res.render('reviews', {userReview: userReview});   
            }
        });
    }
});

app.post('/reviews', (req, res) => {

});

/*
app.get('/:slug', (req, res) => {
	User.findOne({username: req.params.slug}, (err, user) => {
		if(err){
			console.log(err);
		} else if(user){
			res.render('home', {fname: user.firstname, lname: user.lastname, username: user.username});
		} else{
			res.redirect('/');
		}
	});
});

app.post('/:slug', (req, res) => {
	//User.findOneAndUpdate({slug: req.params.slug}, {
});
*/
app.listen(process.env.PORT || PORT);
