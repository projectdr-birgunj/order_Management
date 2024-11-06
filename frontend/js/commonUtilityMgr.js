// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getFunctions,
  httpsCallable,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-functions.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import {
  getDatabase,
  ref,
  update,
  get,
  push,
  child,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";
// import * as Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";

import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-messaging.js";
// Firebase configuration
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
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);
const functions = getFunctions(app);
let itemPrices;
let itemNames;
let userName;
let userUid;

//Push notification changes start
// Firebase Cloud Messaging (FCM) code in common.js
// Request permission to send notifications
// Notification.requestPermission()
//   .then((permission) => {
//     if (permission === "granted") {
//       console.log("Notification permission granted.");

//       // Get the token
//       return getToken(messaging, {
//         vapidKey:
//           "BFr_X_p8nTC6jBjWTHfkcSxp0pIv8r11UyEOaTYXdUfS_SjdsFAHdzsnrxxl6Zygt-UtToeYBs3v4ZVuTKheBnA",
//       }); // Replace with your VAPID key
//     } else {
//       console.log("Unable to get permission to notify.");
//     }
//   })
//   .then((token) => {
//     if (token) {
//       console.log("FCM Token:", token);
//       // Store/send token to the server if necessary
//     }
//   })
//   .catch((err) => {
//     console.error("Error getting permission for notifications", err);
//   });

// // messaging.subscribeToTopic("allUsers").then(() => {
// //   console.log("Subscribed to topic");
// // }); //Push notification changes ends

// Fetch data from Firestore
async function fetchItemPrices() {
  try {
    const itemPrices = {};
    const querySnapshot = await getDocs(collection(db, "itemPrices"));
    querySnapshot.forEach((doc) => {
      itemPrices[doc.id] = doc.data().price; // Assuming each document has a `price` field
    });
    return itemPrices;
  } catch (error) {
    console.error("Error fetching itemPrices:", error);
    throw error;
  }
}

async function fetchItemNames() {
  try {
    const docRef = doc(db, "itemNames", "names");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().names;
    } else {
      console.log("No such document!");
      return [];
    }
  } catch (error) {
    console.error("Error fetching itemNames:", error);
    throw error;
  }
}

// SweetAlert2 utility function
function showAlert(title, text, shouldReload = true) {
  Swal.fire({
    title: title,
    text: text,
    icon: "info",
    confirmButtonText: "OK",
  }).then((result) => {
    if (result.isConfirmed && shouldReload) {
      location.reload();
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");

  try {
    itemPrices = await fetchItemPrices();
    itemNames = await fetchItemNames();

    // console.log("Item Prices:", itemPrices);
    // console.log("Item Names:", itemNames);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

function getUserName() {
  return userName;
}

function setUserName(a_userName) {
  userName = a_userName;
}

function getUserUid() {
  return userUid;
}

function setUserUid(a_userUid) {
  userUid = a_userUid;
}

// auth.js

// function checkUserRole(requiredRole, onSuccess)
async function checkUserRole(
  requiredRole,
  onSuccess,
  redirectPage = "index.html"
) {
  console.log("commonUtilityMgr:checkUserRole() called");
  onAuthStateChanged(auth, async (user) => {
    console.log("commonUtilityMgr:checkUserRole() onAuthStateChanged called");
    if (user) {
      const uid = user.uid;

      try {
        // Retrieve the user role from Firestore
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const role = userDoc.data().role;

          const vapidKey =
            "BFr_X_p8nTC6jBjWTHfkcSxp0pIv8r11UyEOaTYXdUfS_SjdsFAHdzsnrxxl6Zygt-UtToeYBs3v4ZVuTKheBnA"; // Replace with your actual VAPID key
          const fcmToken = await getToken(messaging, { vapidKey });

          if (fcmToken) {
            // Call the saveToken function to store the FCM token
            const saveToken = httpsCallable(functions, "saveToken");
            await saveToken({ token: fcmToken });
            // console.log("FCM token saved successfully");
          } else {
            console.log("No FCM token available. Permission may be required.");
          }

          // Check if role matches the required role
          if (role !== requiredRole) {
            console.log("It shouldn't Hit");
            alert(
              `Access denied for ${requiredRole} role. Redirecting to login.`
            );
            window.location.href = redirectPage;
          } else {
            console.log("It should Hit");
            document.body.style.display = "block";
            onSuccess();
          }
        } else {
          console.error("User document not found. Redirecting to login.");
          window.location.href = redirectPage;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        window.location.href = redirectPage;
      }
    } else {
      // Redirect to login if not authenticated
      window.location.href = redirectPage;
    }
  });
}

function logOut() {
  console.log("Logout called");
  signOut(auth)
    .then(() => {
      console.log("Logout called");
      console.log(
        "iusLoggedIn Value check: ",
        localStorage.getItem("isLoggedIn")
      );
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      window.location.href = "index.html"; // Redirect to login page after successful logout
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

export {
  app,
  database,
  auth,
  db,
  messaging,
  onMessage,
  itemPrices,
  itemNames,
  showAlert,
  checkUserRole,
  logOut,
  onAuthStateChanged,
  signOut,
  ref,
  update,
  get,
  push,
  child,
  onValue,
  doc,
  getDoc,
  getDocs,
  setDoc,
  collection,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
  getUserName,
  setUserName,
  getUserUid,
  setUserUid,
};
