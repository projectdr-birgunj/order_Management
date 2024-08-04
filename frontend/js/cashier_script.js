import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

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

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed");

  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  async function fetchOrders(button) {
    try {
      const orderId = button.getAttribute("data-table-no");
      const tableID = orderId.toLowerCase();
      // console.log("Inside orderID if:", tableID);
      if (orderId) {
        // console.log("Inside orderID if:", orderId);
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "orders/" + orderId));
        let orders = snapshot.val();
        if (orders) {
          // console.log("Inside orders if:", orders);
          const to_billing_var = orders["toBilling"];
          // console.log("to_billing", to_billing_var);
          if (to_billing_var != "true") {
            alert("Table not cleared yet! Please wait");
            location.reload(); // Reload the page
            return;
          } else if (to_billing_var == "true") {
            displayBillDetails(orders, tableID);
          } else {
            alert("This should not show. Please contact Developer!!");
          }
        } else {
          orders = null;
          displayBillDetails(orders, button);
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayOrders() {
    // Function to create buttons
    const buttonsContainer = document.getElementById("order-list");
    for (let i = 1; i <= 10; i++) {
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.onclick = function () {
        fetchOrders(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  window.onload = displayOrders;

  function displayBillDetails(orders, tableID) {
    // Clear any existing content in the display area
    const displayArea = document.getElementById("ordersContainer");
    displayArea.innerHTML = ""; // Clear previous data

    if (!orders) {
      displayArea.innerHTML = "<p>No orders found for this table.</p>";
      return;
    }

    // Display order details
    const {
      custName,
      orderDetail,
      tableClosed,
      timeStamp,
      toBilling,
      waiterName,
    } = orders;

    // Display customer and order details
    displayArea.innerHTML += `<h2>Order Details for Table: ${tableID}</h2>`;
    displayArea.innerHTML += `<p>Customer Name: ${custName}</p>`;
    displayArea.innerHTML += `<p>Table Closed: ${tableClosed}</p>`;
    displayArea.innerHTML += `<p>Time Stamp: ${timeStamp}</p>`;
    displayArea.innerHTML += `<p>To Billing: ${toBilling}</p>`;
    displayArea.innerHTML += `<p>Waiter Name: ${waiterName}</p>`;

    // Extract items ordered from the order_detail
    const itemsOrderedString = orderDetail[tableID]; // This is a string
    let itemsOrdered;

    try {
      // Parse the string into a JavaScript object (array)
      itemsOrdered = JSON.parse(itemsOrderedString);
    } catch (error) {
      console.error("Error parsing items ordered:", error);
      displayArea.innerHTML +=
        "<p>Error parsing items ordered. Please check the data.</p>";
      return;
    }

    // Display items ordered
    if (Array.isArray(itemsOrdered)) {
      displayArea.innerHTML += "<h3>Items Ordered:</h3>";
      itemsOrdered.forEach((item) => {
        displayArea.innerHTML += `<p>Item Name: ${item.itemName}, Quantity: ${item.quantity}, Note: ${item.note}, Dine In: ${item.dineIn}</p>`;
      });
    } else {
      displayArea.innerHTML += "<p>No items ordered.</p>";
    }
  }

  // Example HTML Structure
  // Make sure to add this in your HTML file
  // <div id="ordersContainer"></div>

  // Example of calling the function
  // displayOrders(exampleOrders, 'table1');

  // fetchOrders();
   
  // Adding logout functionality
  document.getElementById("logout")?.addEventListener("click", function () {
    localStorage.removeItem("isLoggedIn");
    alert("You have been logged out.");
    window.location.href = "index.html";
  });

  document
    .getElementById("generate-bill")
    ?.addEventListener("click", function () {
      alert("Bill Generated!");
    });
});
