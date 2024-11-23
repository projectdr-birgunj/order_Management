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
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-firestore.js";
import {
  getMessaging,
  getToken,
} from "https://www.gstatic.com/firebasejs/9.21.0/firebase-messaging.js";

import { setUserName, setUserUid } from "../js/commonUtilityMgr.js";

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
// document.getElementById("loginForm").addEventListener("submit", async (e) => {
//   e.preventDefault();

//   const email = document.getElementById("loginEmail").value;
//   const password = document.getElementById("loginPassword").value;

//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     const user = userCredential.user;

//     // Fetch user role from Firestore
//     const userDoc = await getDoc(doc(db, "users", user.uid));
//     const role = userDoc.data().role;
//     let targetPage = "index.html";

//     switch (role) {
//       case "waiter":
//         targetPage = "waiter.html";
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", role);
//         break;
//       case "chef":
//         targetPage = "chef.html";
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", role);
//         break;
//       case "cashier":
//         targetPage = "cashier.html";
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", role);
//         break;
//       case "admin":
//         targetPage = "admin.html";
//         localStorage.setItem("isLoggedIn", "true");
//         localStorage.setItem("userRole", role);
//         break;
//       default:
//         document.getElementById("loginErrorMessage").textContent =
//           "Invalid role or user not assigned a role.";
//     }
//     console.log("Is LoggedIn value: ", localStorage.getItem("isLoggedIn"));
//     (async () => {
//       console.log("Start");
//       await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 10000 milliseconds (10 seconds)
//       console.log("This message is displayed after 10 seconds");
//       console.log("End");
//     })();
//     window.location.href = targetPage;
//   } catch (error) {
//     document.getElementById("loginErrorMessage").textContent = error.message;
//   }
// });

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
    let targetPage = "index.html";
    setUserName(userDoc.data().name);
    setUserUid(user.uid);

    // Save user status (isOnline and lastActive) to Firestore
    await updateUserStatus(user.uid, true);

    // Token management
    // const token = await getFCMToken(user.uid, role);

    // Redirect based on role
    switch (role) {
      case "waiter":
        targetPage = "waiter.html";
        break;
      case "chef":
        targetPage = "chef.html";
        break;
      case "cashier":
        targetPage = "cashier.html";
        break;
      case "admin":
        targetPage = "admin.html";
        break;
      default:
        document.getElementById("loginErrorMessage").textContent =
          "Invalid role or user not assigned a role.";
    }

    // Store login status in localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    // if (window.AndroidInterface) {
    //   window.AndroidInterface.onUserSignedIn(user.uid);
    // }

    window.location.href = targetPage;
  } catch (error) {
    document.getElementById("loginErrorMessage").textContent = error.message;
  }
});

// Function to update user online status and last active timestamp
async function updateUserStatus(userId, isOnline) {
  const userStatusRef = doc(db, `users/${userId}`);
  await setDoc(
    userStatusRef,
    {
      isOnline: isOnline,
      lastActive: serverTimestamp(),
    },
    { merge: true }
  ); // Merge to update without overwriting existing data
}

// Function to get FCM token and store it in Firestore
async function getFCMToken(userId, role) {
  // const messaging = getMessaging();
  let token;

  try {
    // Try to retrieve the current token
    token = await getTokenHere();
    console.log("Token is : " + token);

    if (token) {
      // Construct the token reference path with userId
      const tokenRef = doc(db, `auth/tokens/${role}/${userId}`);
      console.log("Token reference path:", `tokens/${role}/${userId}`);

      try {
        console.log("Storing token in Firestore...");

        // Check the data being stored
        const tokenData = {
          token: token,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        console.log("Data to be stored:", tokenData); // Log the data being stored

        // Store the token in Firestore
        await setDoc(tokenRef, tokenData, { merge: true });

        console.log("Token successfully stored in Firestore:", token); // Log on successful storage
      } catch (error) {
        console.error("Error storing token in Firestore:", error); // Log any errors that occur during storage
      }
    } else {
      console.log("No token available to store."); // Log if there is no token
    }
  } catch (error) {
    console.error("Failed to retrieve token:", error);
  }

  return token;
}

// async function getTokenHere() {
//   let token;
//   Notification.requestPermission().then((permission) => {
//     const messaging = getMessaging();
//     if (permission === "granted") {
//       console.log("Notification permission granted.");

//       getToken(messaging, {
//         vapidKey:
//           "BFr_X_p8nTC6jBjWTHfkcSxp0pIv8r11UyEOaTYXdUfS_SjdsFAHdzsnrxxl6Zygt-UtToeYBs3v4ZVuTKheBnA",
//       })
//         .then((currentToken) => {
//           if (currentToken) {
//             token = currentToken;
//             console.log("FCM Token:", currentToken);
//             // Send the token to your server or save it
//           } else {
//             console.log("No registration token available.");
//           }
//         })
//         .catch((err) => {
//           console.log("An error occurred while retrieving token. ", err);
//         });
//     } else {
//       console.log("Unable to get permission to notify.");
//     }
//   });
//   return token;
// }

async function getTokenHere() {
  const vapidKey =
    "BFr_X_p8nTC6jBjWTHfkcSxp0pIv8r11UyEOaTYXdUfS_SjdsFAHdzsnrxxl6Zygt-UtToeYBs3v4ZVuTKheBnA";
  let token;
  const permission = await Notification.requestPermission(); // Wait for the permission to be requested

  if (permission === "granted") {
    console.log("Notification permission granted.");

    const messaging = getMessaging(); // Get messaging instance

    try {
      // Await the token retrieval
      token = await getToken(messaging, { vapidKey });

      if (token) {
        console.log("FCM Token:", token);
        // You can send the token to your server or save it as needed
      } else {
        console.log("No registration token available.");
      }
    } catch (err) {
      console.log("An error occurred while retrieving token: ", err);
    }
  } else {
    console.log("Unable to get permission to notify.");
  }

  return token; // Return the retrieved token
}

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
