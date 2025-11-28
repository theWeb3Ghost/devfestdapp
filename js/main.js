import api from "./api.js";

// ===============================
// ELEMENTS
// ===============================
const el = {
  greeting: document.getElementById("greeting"),
  username: document.getElementById("username"),
  uid: document.getElementById("uid"),
  balance: document.getElementById("token-balance"),
  mint: document.getElementById("mint-amount"),

  sendBtn: document.getElementById("send-btn"),
  receiveBtn: document.getElementById("receive-btn"),
  sendForm: document.getElementById("send-form"),
  submitSend: document.getElementById("submit-send"),
  cancelSend: document.getElementById("cancel-send"),

  toInput: document.getElementById("to-input"),
  amountInput: document.getElementById("amount-input"),

  claimBtn: document.getElementById("claim-btn"), // Mint button
};

// ===============================
// STATE
// ===============================
let user = null;

// ===============================
// GREETING SYSTEM
// ===============================
const greetings = [
  n => `Good morning, ${n}! Ready to fly?`,
  n => `Good afternoon, ${n}. Check your balance.`,
  n => `Hey ${n}, send some tokens today.`,
  n => `${n}, remember: max 19 tokens per transaction!`,
];

function cycleGreeting() {
  if (!user) return;
  const name = user.displayName || "friend";
  const msg = greetings[Math.floor(Math.random() * greetings.length)](name);
  el.greeting.textContent = msg;
}

// ===============================
// BALANCE FETCHER
// ===============================
async function refreshBalances() {
  if (!user) return;

  try {
    const { balance } = await api.fetchBalance(user.uid);
    user.balance = balance;
    el.balance.textContent = balance;
    el.mint.textContent = balance; // Show balance in the mint area
  } catch (err) {
    el.balance.textContent = "—";
    el.mint.textContent = "MINT";
    console.error("Balance fetch failed:", err);
  }
}

// ===============================
// CLAIM TOKENS
// ===============================
async function claimTokens() {
  try {
    el.claimBtn.disabled = true;

    const resp = await api.claimTokens(); // Calls backend token/claim
    alert(`Claim successful! You received ${resp.amount || 0} tokens.`);

    await refreshBalances(); // Update balance after claiming
  } catch (err) {
    console.error(err);
    alert("Claim failed: " + err.message);
  } finally {
    el.claimBtn.disabled = false;
  }
}

// ===============================
// ANIMATIONS
// ===============================
function animatePlane(type) {
  const svg = document.querySelector(type === "send" ? ".plane.send" : ".plane.receive");
  svg.classList.remove("fly-animation", "fall-animation");
  void svg.offsetWidth; // restart animation
  svg.classList.add(type === "send" ? "fly-animation" : "fall-animation");
}

// ===============================
// SEND TOKENS
// ===============================
async function sendTokens() {
  const to = el.toInput.value.trim();
  const amount = Number(el.amountInput.value);

  if (!to) return alert("Enter recipient username.");
  if (amount < 1 || amount > 19) return alert("Amount must be between 1–19.");
  if (user.balance < amount) return alert("Insufficient balance.");

  try {
    el.submitSend.disabled = true;

    await api.sendTokens(to, amount); // No UID/token needed, backend uses Firebase auth

    alert("Transfer successful!");
    await refreshBalances();
    el.sendForm.classList.add("hidden");
  } catch (err) {
    console.error(err);
    alert("Send failed: " + err.message);
  } finally {
    el.submitSend.disabled = false;
  }
}

// ===============================
// UI EVENT HANDLERS
// ===============================
el.sendBtn.addEventListener("click", () => {
  animatePlane("send");
  el.sendForm.classList.remove("hidden");
});

el.receiveBtn.addEventListener("click", () => animatePlane("receive"));
el.cancelSend.addEventListener("click", () => el.sendForm.classList.add("hidden"));
el.submitSend.addEventListener("click", sendTokens);
el.claimBtn.addEventListener("click", claimTokens);

// ===============================
// AUTH EVENT (triggered by auth.js)
// ===============================
window.addEventListener("app:auth", async (e) => {
  user = e.detail;

  el.username.textContent = user.displayName || "User";
  el.uid.textContent = user.uid;

  await refreshBalances();
  cycleGreeting();

  setInterval(cycleGreeting, 120000);   // 2 min greeting rotation
  setInterval(refreshBalances, 20000);  // 20 sec balance check
});
