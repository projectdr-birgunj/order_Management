// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
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
let itemPrices;
let itemNames;

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

// auth.js

function checkUserRole(requiredRole, onSuccess) {
  if (
    localStorage.getItem("isLoggedIn") === "true" &&
    localStorage.getItem("userRole") === requiredRole
  ) {
    console.log(`${requiredRole} localStorage called`);
    document.body.style.display = "block";
    onSuccess(); // Run role-specific setup
  } else {
    console.log(
      `Access denied for role: ${localStorage.getItem(
        "userRole"
      )}, required: ${requiredRole}`
    );
    window.location.href = "index.html"; // Redirect to login if roles don't match
  }
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
};
