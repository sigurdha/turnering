// firebase-config.js
const firebaseConfig = {
  apiKey: "AIzaSyAtS2K6Q2SKmnmZTDQK7YEPzfKp41JDfCQ",
  authDomain: "turnering-7ac64.firebaseapp.com",
  databaseURL: "https://turnering-7ac64-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "turnering-7ac64",
  storageBucket: "turnering-7ac64.appspot.com",
  messagingSenderId: "942774569294",
  appId: "1:942774569294:web:c3b648d93d52f6770ef61f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
