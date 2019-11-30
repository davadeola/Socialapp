const functions = require('firebase-functions');

const express = require('express');
const app = express();


const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser} = require('./handlers/users');

const FBAuth = require('./util/FBAuth')


//scream route
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);

//user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);

//image upload

app.post('/user/image',FBAuth, uploadImage)

//check it out => exports.api = functions.region.().https.onRequest(app);

exports.api = functions.https.onRequest(app);
