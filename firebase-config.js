
// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey-PLACEHOLDER",
  authDomain: "nesodden-tennis.firebaseapp.com",
  databaseURL: "https://nesodden-tennis-default-rtdb.firebaseio.com",
  projectId: "nesodden-tennis",
  storageBucket: "nesodden-tennis.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:demo1234567890"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
