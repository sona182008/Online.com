/* Renu Store Pro — Firebase authentication bridge.
   Add real Firebase Web App credentials below to enable account features. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
    signInWithPopup, GoogleAuthProvider, signOut, sendPasswordResetEmail,
    onAuthStateChanged, updateProfile, setPersistence,
    browserLocalPersistence, browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

"use strict";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

const configured = Object.values(firebaseConfig).every(value =>
    value && !String(value).includes("YOUR_")
);

let auth = null;
let googleProvider = null;

if (configured) {
    try {
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
}

function toast(message) {
    if (typeof window.showToast === "function") window.showToast(message);
}

function showAuthMessage(elementId, text, type = "error") {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
        element.style.display = "block";
        element.className = `login-message ${type}`;
    }
    toast(`${type === "success" ? "✓" : "!"} ${text}`);
}

function getFirebaseErrorMessage(error) {
    const messages = {
        "auth/email-already-in-use": "This email is already registered.",
        "auth/invalid-email": "Please enter a valid email address.",
        "auth/user-not-found": "No account was found for this email.",
        "auth/wrong-password": "Invalid email or password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/popup-closed-by-user": "Google sign-in was cancelled.",
        "auth/network-request-failed": "Network error. Please check your connection.",
        "auth/operation-not-allowed": "This sign-in method is not enabled in Firebase.",
        "auth/too-many-requests": "Too many attempts. Please try again later."
    };
    return messages[error?.code] || error?.message || "Authentication failed.";
}

async function requireAuth(action) {
    if (!auth) {
        showAuthMessage("loginMessage", "Authentication is not configured yet. Add your Firebase Web App credentials in auth.js.");
        showAuthMessage("signupMessage", "Authentication is not configured yet. Add your Firebase Web App credentials in auth.js.");
        showAuthMessage("resetMessage", "Authentication is not configured yet. Add your Firebase Web App credentials in auth.js.");
        return false;
    }
    await action();
    return true;
}

async function logout() {
    if (!auth) return;
    try {
        await signOut(auth);
        toast("Logged out successfully");
        window.location.href = "login.html";
    } catch (error) {
        console.error(error);
        toast("Could not log out");
    }
}
window.logout = logout;

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async event => {
            event.preventDefault();
            const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
            const password = document.getElementById("loginPassword")?.value;
            const remember = document.getElementById("rememberMe")?.checked;
            const button = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                showAuthMessage("loginMessage", "Enter your email and password.");
                return;
            }
            if (!auth) {
                showAuthMessage("loginMessage", "Authentication is not configured yet. Add your Firebase credentials in auth.js.");
                return;
            }

            const original = button.textContent;
            button.disabled = true;
            button.textContent = "Signing in…";
            try {
                await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
                await signInWithEmailAndPassword(auth, email, password);
                showAuthMessage("loginMessage", "Login successful. Redirecting…", "success");
                setTimeout(() => window.location.href = "index.html", 700);
            } catch (error) {
                showAuthMessage("loginMessage", getFirebaseErrorMessage(error));
                button.disabled = false;
                button.textContent = original;
            }
        });
    }

    const googleButton = document.querySelector(".google-login");
    if (googleButton) {
        googleButton.addEventListener("click", async () => {
            if (!auth || !googleProvider) {
                showAuthMessage("loginMessage", "Google sign-in is not configured yet.");
                return;
            }
            googleButton.disabled = true;
            try {
                await signInWithPopup(auth, googleProvider);
                window.location.href = "index.html";
            } catch (error) {
                showAuthMessage("loginMessage", getFirebaseErrorMessage(error));
                googleButton.disabled = false;
            }
        });
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
        signupForm.addEventListener("submit", async event => {
            event.preventDefault();
            const name = document.getElementById("signupName")?.value.trim();
            const email = document.getElementById("signupEmail")?.value.trim().toLowerCase();
            const password = document.getElementById("signupPassword")?.value;
            const confirm = document.getElementById("confirmPassword")?.value;
            const terms = document.getElementById("termsCheckbox")?.checked;
            const button = document.getElementById("signupButton");

            if (!name || name.length < 2) return showAuthMessage("signupMessage", "Enter your full name.");
            if (!email) return showAuthMessage("signupMessage", "Enter a valid email address.");
            if (!password || password.length < 6) return showAuthMessage("signupMessage", "Password must be at least 6 characters.");
            if (password !== confirm) return showAuthMessage("signupMessage", "Passwords do not match.");
            if (!terms) return showAuthMessage("signupMessage", "Please accept the Terms & Conditions.");
            if (!auth) return showAuthMessage("signupMessage", "Authentication is not configured yet. Add your Firebase credentials in auth.js.");

            const original = button.textContent;
            button.disabled = true;
            button.textContent = "Creating account…";
            try {
                const credential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(credential.user, { displayName: name });
                showAuthMessage("signupMessage", "Account created. Redirecting…", "success");
                setTimeout(() => window.location.href = "index.html", 800);
            } catch (error) {
                showAuthMessage("signupMessage", getFirebaseErrorMessage(error));
                button.disabled = false;
                button.textContent = original;
            }
        });
    }

    const resetForm = document.getElementById("forgotPasswordForm");
    if (resetForm && document.getElementById("resetEmail")) {
        resetForm.addEventListener("submit", async event => {
            event.preventDefault();
            const email = document.getElementById("resetEmail").value.trim().toLowerCase();
            const button = document.getElementById("resetButton");
            if (!email) return showAuthMessage("resetMessage", "Enter your email address.");
            if (!auth) return showAuthMessage("resetMessage", "Authentication is not configured yet.");
            button.disabled = true;
            try {
                await sendPasswordResetEmail(auth, email);
                showAuthMessage("resetMessage", "Password reset email sent.", "success");
            } catch (error) {
                showAuthMessage("resetMessage", getFirebaseErrorMessage(error));
            } finally {
                button.disabled = false;
            }
        });
    }

    if (auth) {
        onAuthStateChanged(auth, user => {
            document.querySelectorAll('a[href="login.html"]').forEach(link => {
                if (user) {
                    link.textContent = `Hi, ${(user.displayName || "Account").split(" ")[0]}`;
                    link.href = "#";
                    link.onclick = event => { event.preventDefault(); logout(); };
                }
            });
        });
    }
});
