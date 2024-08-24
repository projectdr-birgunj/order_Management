// Import Firebase modules (ESM)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcUrYx_eLswtcKPBpgJVyPWdyveDZLSyk",
  authDomain: "resturant-order-1d2b3.firebaseapp.com",
  databaseURL: "https://resturant-order-1d2b3-default-rtdb.firebaseio.com",
  projectId: "resturant-order-1d2b3",
  storageBucket: "resturant-order-1d2b3.appspot.com",
  messagingSenderId: "971852262554",
  appId: "1:971852262554:web:fefe99d0997f56f79e0323",
  measurementId: "G-4TS2JLW1BY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Registration
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;
    const name = document.getElementById("registerName").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save user role in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        name: name,
      });

      alert("User registered successfully!");
      document.getElementById("registerForm").reset();
    } catch (error) {
      document.getElementById("registerErrorMessage").textContent =
        error.message;
    }
  });

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user role from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.data().role;

    switch (role) {
      case "waiter":
        window.location.href = "waiter.html";
        break;
      case "chef":
        window.location.href = "chef.html";
        break;
      case "cashier":
        window.location.href = "cashier.html";
        break;
      case "admin":
        window.location.href = "admin.html";
        break;
      default:
        document.getElementById("loginErrorMessage").textContent =
          "Invalid role or user not assigned a role.";
    }
  } catch (error) {
    document.getElementById("loginErrorMessage").textContent = error.message;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const registerSection = document.getElementById("registerSection");
  const loginSection = document.getElementById("loginSection");
  const showRegisterLink = document.getElementById("showRegister");
  const showLoginLink = document.getElementById("showLogin");

  // Show login form and hide registration form
  showLoginLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerSection.style.display = "none";
    loginSection.style.display = "block";
  });

  // Show registration form and hide login form
  showRegisterLink.addEventListener("click", (e) => {
    e.preventDefault();
    registerSection.style.display = "block";
    loginSection.style.display = "none";
  });
});
