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

const loginForm = document.getElementById("loginForm");
const loginButton = document.getElementById("submit");
const errorMessage = document.getElementById("loginErrorMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Add the loading class to the button
  loginButton.classList.add("loading");

  // Add the loader SVG to the button (only if it's not already added)
  if (!loginButton.querySelector("svg")) {
    loginButton.innerHTML = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
          x="0px" y="0px" width="20px" height="20px" viewBox="0 0 40 40" xml:space="preserve">
          <path opacity="0.2" fill="#000" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946
            s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634
            c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/>
          <path fill="#000" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0
            C22.32,8.481,24.301,9.057,26.013,10.047z">
            <animateTransform attributeType="xml"
              attributeName="transform"
              type="rotate"
              from="0 20 20"
              to="360 20 20"
              dur="0.9s"
              repeatCount="indefinite"/>
          </path>
        </svg>`;
  }

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
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
  } finally {
    // Remove loading class and reset button text
    loginButton.classList.remove("loading");
    loginButton.innerHTML = "Login";
  }
});
