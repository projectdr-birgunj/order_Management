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
// import Swal from "https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.all.min.js";

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
let itemPrices;
let itemNames;

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
function showAlert(title, text) {
  Swal.fire({
    title: title,
    text: text,
    icon: "info",
    confirmButtonText: "OK",
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");

  try {
    itemPrices = await fetchItemPrices();
    itemNames = await fetchItemNames();

    console.log("Item Prices:", itemPrices);
    console.log("Item Names:", itemNames);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
});

export {
  app,
  database,
  auth,
  db,
  itemPrices,
  itemNames,
  showAlert,
  onAuthStateChanged,
  signOut,
  ref,
  update,
  get,
  push,
  child,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  deleteDoc,
  arrayRemove,
};
