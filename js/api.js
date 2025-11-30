import { API_BASE } from './config.js';
// ===============================
// API CONFIG
// ===============================
const baseURL = API_BASE ;

// ===============================
// INTERNAL: JSON POST HELPER
// ===============================
async function postJson(path, body = {}, authToken = null) {
  const headers = { "Content-Type": "application/json" };

  if (authToken) {
    headers["Authorization"] = "Bearer " + authToken;
  }

  const res = await fetch(baseURL + path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  // If API fails, try to extract message
  if (!res.ok) {
    const msg = await safeJson(res);
    throw new Error(msg?.error || "API error " + res.status);
  }

  return await res.json();
}

// Safely decode JSON without breaking when backend sends HTML error
async function safeJson(res) {
  try { return await res.json(); }
  catch { return null; }
}

// ===============================
// FIREBASE TOKEN GETTER
// ===============================
// Automatically request Firebase token on-demand
async function getAuthToken() {
  if (!window.firebaseUser) return null;
  try {
    return await window.firebaseUser.getIdToken();
  } catch {
    return null;
  }
}

// ===============================
// PUBLIC API FUNCTIONS
// ===============================
export async function fetchBalance(uid) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("Not authenticated");

 
  const res = await fetch(`${API_BASE}/user/${uid}`, {
    method: "GET",
    headers: {
      "Authorization": "Bearer " + authToken,
      "Content-Type": "application/json",
    }
  });

  if (!res.ok) {
    const msg = await res.json().catch(() => null);
    throw new Error(msg?.error || "API error " + res.status);
  }

  return await res.json();
}



// -------------------- Claim Tokens --------------------
export async function claimTokens() {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("Not authenticated");

  // No UID is sent; backend uses req.user.uid
  return await postJson("/token/claim", {}, authToken);
}

// -------------------- Send Tokens --------------------
export async function sendTokens(toUsername, amount) {
  const authToken = await getAuthToken();
  if (!authToken) throw new Error("Not authenticated");

  return await postJson("/token/send", { toUsername, amount }, authToken);
}

// -------------------- save users to backend --------------------
export async function ensureUserRegistered(uid, name) {
  try {
    await fetchBalance(uid);
  } catch (err) {
    if (err.message === "User not found") {
      const authToken = await getAuthToken();
      await postJson("/user/register", { uid, name }, authToken);
      console.log("User registered in backend");
    } else {
      throw err;
    }
  }
}

// ===============================
// EXPORT MODULE
// ===============================
export default {
  fetchBalance,
  sendTokens,
  claimTokens,
  ensureUserRegistered,
};
