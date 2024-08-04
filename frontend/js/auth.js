// auth.js
window.addEventListener('DOMContentLoaded', (event) => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert("Access denied. Please log in first.");
        window.location.href = "login.html";
    }
});

function logout() {
    localStorage.removeItem("isLoggedIn");
    alert("You have been logged out.");
    window.location.href = "login.html";
}
