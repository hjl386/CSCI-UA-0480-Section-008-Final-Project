//db.js - Database.js

const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
//Slugs would be used whenever we are on the users profile to identify them 

const Match = new mongoose.Schema({
	username: String,				//To identify who you matched with 
	hasSwipes: Boolean,				//By default would be the opposite of the User they matched with, can be false or true, depending on what the user was set at when they first matched 
	title: String,					//Title 
});
//Array of all the people a user matched with 
//Match.plugin(URLSlugs('title'));

const Review = new mongoose.Schema({
	username: String,				//The user who commented 
	comments: String,				//Comment
	rating: Number 					//Out of 10 
});

const Critique = new mongoose.Schema({
	username: String,				//The user you commented on 
	comments: String,				//Comment
	rating: Number					//Your rating out of 10 for them
});

const User = new mongoose.Schema({
	username: String, 				//Unique Username, will have to do validation
	//password: Hashed password value 		//Will implement 
	email: String, 					//Will parse to check for @NYU (Validation)
	hasSwipes: {type: Boolean, default:false},	//False - Needs Swipes, True - Provides Swipes
	title: String,					//Used for the slug, what people see you as
	matches: [Match],				//Array of the people they matched to
	reviews: [Review],				//Array of reviews other users wrote about you
	critiques: [Critique]				//Array of critiques you wrote about other users
});
User.plugin(URLSlugs('title'));
//User schema - Identifies each individual 

// PROVIDED CODE FOR DATABASE DEPLOYMENT ON TO CIMS 
//Checks to see if the environment variable, NODE_ENV is set to PRODUCTION?
if (process.env.NODE_ENV === 'PRODUCTION'){
	//If we're in PRODUCTION mode, then read the configuration from a file 
	//Use Blocking file IO to do this ... 
	var fs = require('fs');
	var path = require('path');
	var fn = path.join(__dirname, 'config.json');
 	var data = fs.readFileSync(fn);
	 // our configuration file will be in json, so parse it and set the conenction string appropriately!
	var conf = JSON.parse(data);
	var dbconf = conf.dbconf;
} else {
	// if we're not in PRODUCTION mode, then use
	dbconf = 'mongodb://localhost/hjl386';
}

mongoose.model('User', User);
mongoose.model('Match', Match);
mongoose.model('Review', Review);
mongoose.model('Critique', Critique);

mongoose.connect(dbconf);
