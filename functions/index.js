const functions = require('firebase-functions');
const {db} = require('./util/admin')
const express = require('express');
const app = express();


const {getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream} = require('./handlers/screams');
const {signup, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead} = require('./handlers/users');

const FBAuth = require('./util/FBAuth')


//scream route
app.get('/screams', getAllScreams);
app.post('/scream',FBAuth, postOneScream);
app.get('/scream/:screamId' , getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);

//user routes
app.post('/signup', signup);
app.post('/login', login);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails)
app.post('/notifications',FBAuth, markNotificationsRead)

//image upload

app.post('/user/image',FBAuth, uploadImage)

//check it out => exports.api = functions.region.().https.onRequest(app);

exports.api = functions.https.onRequest(app);


exports.createNotificationsOnLike = functions.firestore.document('likes/{id}')
.onCreate((snapshot)=>{
  db.doc(`/screams/${snapshot.data().screamId}`).get()
  .then(doc=>{

    if (doc.exists) {
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type:'like',
        read: false,
        screamId: doc.id
      })
    }
  }).then(()=>{
    return;
  }).catch((err)=>{
    console.error(err);
    return;
  })
})

exports.deleteNotificationOnUnlike = functions.firestore.document(`likes/{id}`)
.onDelete(snapshot=>{
  db.doc(`/notifications/${snapshot.id}`)
  .delete()
  .then(()=>{
    return;
  })
  .catch((err)=>{
    console.error(err);
    return;
  })
})

exports.createNotificationsOnComment= functions.firestore.document(`comments/{id}`)
.onCreate((snapshot)=>{
  db.doc(`/screams/${snapshot.data().screamId}`)
  .get()
  .then((doc)=>{
    if (doc.exists) {
      return db.doc(`/notifications/${snapshot.id}`).set({
        createdAt: new Date().toISOString(),
        recipient: doc.data().userHandle,
        sender: snapshot.data().userHandle,
        type:'comments',
        read: false,
        screamId: doc.id
      })
    }
  }).then(()=>{
    return;
  }).catch((err)=>{
    console.error(err);
    return;
  })
})
