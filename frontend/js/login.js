function validateLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "cashAdmin" && password === "cash100") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "cashier.html";
        return false;
    } else if (username === "waiterAdmin" && password === "waiter99") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "waiter.html";
        return false;
    } else if (username === "chiefAdmin" && password === "chief98") {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "chef.html";
        return false;
    } else {
        alert("Invalid username or password");
        return false;
    }
}
