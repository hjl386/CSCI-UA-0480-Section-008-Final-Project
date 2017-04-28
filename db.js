//db.js 

const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');

const User = new mongoose.Schema({
	email: {type: String, unique: true, required: true},
	firstname: {type: String},
	lastname: {type: String},
	username: {type: String, unique: true},
	password: {type: String},
	confirmpassword: {type: String},
	swipes: {type: Boolean, default:false}, 
	description: {type: String},
    match: {type: Array}
});
User.plugin(URLSlugs('username'));

const Match = new mongoose.Schema({
    username: {type: String}, 
    matchUsername: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comments: [{
        text: {type: String},
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
});

if(process.env.NODE_ENV === 'PRODUCTION'){
	const fs = require('fs');
	const path = require('path');
	const fn = path.join(__dirname, 'config.json');
	const data = fs.readFileSync(fn);
	const conf = JSON.parse(data);
	var dbconf = conf.dbconf;
} else{
	dbconf = 'mongodb://localhost/hjl386FP';
}

mongoose.model('User', User);
mongoose.connect(dbconf);
