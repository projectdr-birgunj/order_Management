import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { itemNames } from "./item_price.js";
import { itemPrices } from "./item_price.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = firebase.database();

function storeUserData(user, role) {
  const userId = user.uid;
  database.ref("users/" + userId).set({
    email: user.email,
    role: role,
    lastLogin: new Date().toISOString(),
  });
}

function redirectToRolePage(role) {
  switch (role) {
    case "Waiter":
      window.location.href = "waiter.html";
      break;
    case "Chef":
      window.location.href = "chef.html";
      break;
    case "Cashier":
      window.location.href = "cashier.html";
      break;
    case "Admin":
      window.location.href = "admin.html";
      break;
    default:
      alert("Role not recognized");
  }
}

// Login function
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      database
        .ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          if (userData) {
            storeUserData(user, userData.role);
            redirectToRolePage(userData.role);
          } else {
            alert("No role assigned. Please contact admin.");
          }
        });
    })
    .catch((error) => {
      alert("Login failed: " + error.message);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.getElementById("loginButton");

  if (loginButton) {
    loginButton.addEventListener("click", login);
  } else {
    console.error("Login button not found");
  }
});
