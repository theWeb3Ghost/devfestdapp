import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

export const firebaseConfig = {
    apiKey: "AIzaSyBXiCiLrIMFzNhYcRiqZBtE3KJd0RnEQqM",
  authDomain: "david-website-d04c7.firebaseapp.com",
  projectId: "david-website-d04c7",
  storageBucket: "david-website-d04c7.firebasestorage.app",
  messagingSenderId: "257499808196",
  appId: "1:257499808196:web:ad48543a7cebc828f62491",
  measurementId: "G-C8TJLLZLDK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // this is your auth object
