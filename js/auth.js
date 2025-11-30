import { API_BASE } from './config.js';
import { auth } from './firebase-config.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import API from './api.js';

const provider = new GoogleAuthProvider();
const signInBtn = document.getElementById('google-signin');
const signinScreen = document.getElementById('signin-screen');
const mainScreen = document.getElementById('main-screen');


signInBtn.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    window.firebaseUser = user;
    const idToken = await user.getIdToken();

    const resp = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!resp.ok) throw new Error("Auth backend error");
    const data = await resp.json();

    sessionStorage.setItem('appUser', JSON.stringify(data));
    
// Ensure backend has this user
await API.ensureUserRegistered(user.uid, user.displayName);


    signinScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
    window.dispatchEvent(new CustomEvent('app:auth', { detail: data }));
  } catch (e) {
    alert("Sign-in failed: " + e.message);
  }
});
// auto session restore
const saved = sessionStorage.getItem('appUser');
if (saved) {

  const data = JSON.parse(saved);

  if (auth.currentUser) {
    window.firebaseUser = auth.currentUser;
  }
  signinScreen.classList.add('hidden');
  mainScreen.classList.remove('hidden');
  window.dispatchEvent(new CustomEvent('app:auth', { detail: JSON.parse(saved) }));
}

