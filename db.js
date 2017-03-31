//db.js - Database.js

const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
//Slugs would be used whenever we are on the users profile to identify them 

const User = new mongoose.Schema({
	username: String, 				//Unique Username, will have to do validation
	//password: Hashed password value 		//Will implement 
	email: String, 					//Will parse to check for @NYU (Validation)
	hasSwipes: {type: Boolean, default:false},	//False - Needs Swipes, True - Provides Swipes
	title: String,					//Used for the slug, what people see you as
	matches: [Match]				//Array of the people they matched to
});
User.plugin(URLSlugs('title'));
//User schema - Identifies each individual 


const Match = new mongoose.Schema({
	username: String,				//To identify who you matched with 
	hasSwipes: Boolean,				//By default would be the opposite of the User they matched with, can be false or true, depending on what the user was set at when they first matched 
	title: String,					//Title 
});
//Array of all the people a user matched with 

mongoose.model('User', User);
mongoose.model('Match', Match);

mongoose.connect('mongodb://localhost/finalProject');
