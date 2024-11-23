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
import firebaseConfig from "../js/config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
const db = getFirestore(app);
// let userUid;

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
  console.log("fetchItemNames called");
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

function getUserName() {
  console.log("UserName: " + localStorage.getItem("username"));
  return localStorage.getItem("username");
}

function setUserName(a_userName) {
  localStorage.setItem("username", a_userName);
}

function getUserUid() {
  return localStorage.getItem("userUid");
}

function setUserUid(a_userUid) {
  localStorage.setItem("userUid", a_userUid);
}

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
          console.log("Role " + role + "\tUserRole :" + requiredRole);
          // Check if role matches the required role
          if (role !== requiredRole) {
            console.log("It shouldn't Hit");
            localStorage.clear();
            window.location.href = redirectPage;
          } else {
            // console.log("It should Hit");
            document.body.style.display = "block";
            onSuccess(role);
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", requiredRole);
          }
        } else {
          localStorage.clear(); // Clear storage if user is not authenticated
          console.error("User document not found. Redirecting to login.");
          window.location.href = redirectPage;
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        localStorage.clear(); // Clear storage if user is not authenticated
        window.location.href = redirectPage;
      }
    } else {
      // Redirect to login if not authenticated
      localStorage.clear(); // Clear storage if user is not authenticated
      window.location.href = redirectPage;
    }
  });
}

function logOut() {
  console.log("Logout called");
  signOut(auth)
    .then(async () => {
      console.log("Logout called");
      const userID = localStorage.getItem("userUid");
      const role = localStorage.getItem("userRole");

      try {
        // Get a reference to the document
        const docRef = db.doc(`/auth/tokens/${role}/${userID}`);
        await deleteDoc(docRef);
        console.log(`Document deleted successfully from firestore`);
        while (true) {
          console.log("Iteration:");
        }
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
      localStorage.clear();
      if (window.AndroidInterface) {
        window.AndroidInterface.onUserLoggedOut(userID);
      }
      // window.location.href = "index.html"; // Redirect to login page after successful logout
    })
    .catch((error) => {
      console.error("Error during logout:", error);
    });
}

async function createButtons(fetchOrderDetails, containerId, userRole) {
  console.log("Inside createButtons");
  const buttonsContainer = document.getElementById(containerId);

  const dbRef = ref(database, "orders");
  const snapshot = await get(dbRef);
  let orders = snapshot.val();

  for (let i = 1; i <= 12; i++) {
    let tableKey = "Table-" + i;
    const button = document.createElement("button");
    button.textContent = `Table ${i}`;
    button.setAttribute("data-table-no", `Table-${i}`);
    button.classList.add("table-btn");

    if (orders) {
      console.log("userRole: " + userRole);
      const tableData = orders[tableKey];
      if (userRole === "cashier") {
        // Change toBilling check for chef role
        if (!(tableData.toBilling === true)) {
          // Disable the button if the table is not to be billed
          button.classList.add("disabled-btn");
          button.disabled = true;
        }
      } else {
        // Default check for other roles
        if (!(tableData.toBilling === false)) {
          // Disable the button if the table is closed
          button.classList.add("disabled-btn");
          button.disabled = true;
        }
      }
    } else {
      button.classList.add("disabled-btn");
      button.disabled = true;
    }

    button.onclick = async function () {
      showJsonContainer();
      // Remove active class from all buttons
      const allButtons = document.querySelectorAll(".table-btn");
      allButtons.forEach((btn) => btn.classList.remove("active-btn"));

      // Add active class to the clicked button
      button.classList.add("active-btn");

      // Show loading indicator
      const originalText = button.textContent;
      button.textContent = "Loading...";
      button.disabled = true;

      try {
        await fetchOrderDetails(button); // Execute the async function
      } finally {
        // Revert button text and re-enable it
        button.textContent = originalText;
        button.disabled = false;
      }
    };
    buttonsContainer.appendChild(button);
  }
}

function showJsonContainer() {
  const jsonContainer = document.getElementById("json-container");
  if (jsonContainer) {
    jsonContainer.style.display = "block"; // Show container when a button is clicked
  }
}

export {
  app,
  database,
  auth,
  db,
  fetchItemPrices,
  fetchItemNames,
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
  createButtons,
};
