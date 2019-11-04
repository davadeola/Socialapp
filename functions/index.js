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

//sign up route
app.post('/signup', (req, res)=>{
  const newUser ={
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  }

  //validating users
  db.doc(`/users/${newUser.handle}`).get()
  .then(doc=>{
    if(doc.exists){
      return res.status(400).json({handle: 'This handle is already taken'});
    }else{
      return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
    }
  }).then(data=>{
      return data.user.getIdToken();
  }).then(token=>{
    return res.status(201).json({token});
  }).catch(err=>{
    console.error(err);
    return res.status(500).json({error: err.code})
  })


//default way of creating a new user
//   firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).
//   then(data=>{
//     return res.status(201).json({message: `user ${data.user.uid} signed up successfully`});
//   }).
//   catch(err=>{
//     console.error(err);
//     return res.status(500).json({error: err.code});
//   })

});

//check it out => exports.api = functions.region.().https.onRequest(app);

exports.api = functions.https.onRequest(app);
