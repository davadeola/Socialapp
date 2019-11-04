const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const app = express();
const firebase = require('firebase');


var config={
  apiKey: "AIzaSyCt-CSHlWb8WhNkGvNwvWhwz7bU9j0RGO8",
  authDomain: "socialapp-f352e.firebaseapp.com",
  databaseURL: "https://socialapp-f352e.firebaseio.com",
  projectId: "socialapp-f352e",
  storageBucket: "socialapp-f352e.appspot.com",
  messagingSenderId: "473185452166",
  appId: "1:473185452166:web:ee515cde4f35c328"
};
firebase.initializeApp(config);

admin.initializeApp();

const db = admin.firestore();




app.get('/screams', (req, res)=>{
db
  .collection('screams')
  .orderBy('createdAt', 'desc')
  .get()
  .then((data)=>{
    let screams =[];
    data.forEach((doc)=>{
      screams.push({
        screamId:doc.id,
        body: doc.data().body,
        userHandle: doc.data().userHandle,
        createdAt:doc.data().createdAt
      });
    });
    return res.json(screams);
  })
  .catch(err=>{
    console.error(err);
  });
});

//creating a new scream
app.post('/scream', (req, res)=>{
  const newScream={
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db
  .collection('screams')
  .add(newScream)
  .then((doc)=>{
    res.json({message: `document ${doc.id} created successfully`});
  })
  .catch((err)=>{
    res.status(500).json({error: 'something went wrong'});
    console.error(err);
  });
});

const isEmpty = (string)=>{
  if(string.trim() == ''){
    return true;
  }else{
    return false;
  }
}

const isEmail = (email)=>{
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(regEx)) {
    return true;
  } else {
    return false;
  }
}

//sign up route
let token, userId;
app.post('/signup', (req, res)=>{
  const newUser ={
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email= 'Must not be empty';

  }else if(!isEmail(newUser.email)){
    errors.email='Must be a valid email';
  }

  if(isEmpty(newUser.password)){
    errors.password = 'Must not be empty'
  }

  if (newUser.password != newUser.confirmPassword) {
    errors.confirmPassword = 'Passwords must match'
  }

  if(isEmpty(newUser.handle)){
    errors.handle = 'Must not be empty'
  }


  if(Object.keys(errors).length > 0) return res.status(400).json(errors)
  //validating users
  db.doc(`/users/${newUser.handle}`).get()
  .then(doc=>{
    if(doc.exists){
      return res.status(400).json({handle: 'This handle is already taken'});
    }else{
      return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
    }
  }).then(data=>{
      userId = data.user.uid;
      return data.user.getIdToken();
  }).then(idToken=>{
    token = idToken;
    const userCrendentials ={
      handle: newUser.handle,
      email: newUser.email,
      createdAt: new Date().toISOString(),
      userId
    };
    db.doc(`/users/${newUser.handle}`).set(userCrendentials)
  }).then(()=>{
    return res.status(201).json({token});
  })
  .catch(err=>{
    console.error(err);
    if (err.code == 'auth/email-already-in-use') {
      return res.status(400).json({email: 'Email already in use'})

    }else{
      return res.status(500).json({error: err.code})
    }

  })
});

//check it out => exports.api = functions.region.().https.onRequest(app);

exports.api = functions.https.onRequest(app);
