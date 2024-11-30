import {
  auth,
  db,
  setUserName,
  setUserUid,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  signInWithEmailAndPassword,
} from "../js/commonUtilityMgr.js";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorMessage = document.getElementById("loginErrorMessage");
  errorMessage.textContent = "";

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

    // Save user status (isOnline and lastActive) to Firestore
    // await updateUserStatus(user.uid, true);

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
        errorMessage.textContent = "Invalid role or user not assigned a role.";
    }

    // Store login status in localStorage
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userRole", role);
    setUserName(userDoc.data().name);
    setUserUid(user.uid);
    window.location.href = targetPage;
  } catch (error) {
    console.error("Login error:", error);
    errorMessage.textContent =
      error.message || "An error occurred during login.";
  }
});
