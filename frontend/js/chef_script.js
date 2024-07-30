import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDcUrYx_eLswtcKPBpgJVyPWdyveDZLSyk",
  authDomain: "resturant-order-1d2b3.firebaseapp.com",
  databaseURL: "https://resturant-order-1d2b3-default-rtdb.firebaseio.com",
  projectId: "resturant-order-1d2b3",
  storageBucket: "resturant-order-1d2b3.appspot.com",
  messagingSenderId: "971852262554",
  appId: "1:971852262554:web:fefe99d0997f56f79e0323",
  measurementId: "G-4TS2JLW1BY"
};

document.addEventListener("DOMContentLoaded", () => {
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  async function fetchOrderDetails(button) {
    try {
      const tableNo = button.getAttribute("data-table-no");
      if (tableNo) {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, `orders/${tableNo}`));
        const order = snapshot.val();
        if (order) {
          displayOrderDetails(order, tableNo);
        } else {
          alert("No orders found for this table.");
        }
      } else {
        alert("Cannot fetch table number, contact developer!");
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayOrderDetails(order, tableNo) {
    const displayArea = document.getElementById("order-details");
    displayArea.innerHTML = ""; // Clear previous data

    const {
      cust_Name,
      order_detail,
      table_closed,
      timeStamp,
      to_billing,
      waiter_Name,
    } = order;

    displayArea.innerHTML += `<h2>Order Details for Table: ${tableNo}</h2>`;
    displayArea.innerHTML += `<p>Customer Name: ${cust_Name}</p>`;
    displayArea.innerHTML += `<p>Table Closed: ${table_closed}</p>`;
    displayArea.innerHTML += `<p>Time Stamp: ${timeStamp}</p>`;
    displayArea.innerHTML += `<p>To Billing: ${to_billing}</p>`;
    displayArea.innerHTML += `<p>Waiter Name: ${waiter_Name}</p>`;

    const itemsOrderedString = order_detail[tableNo.toLowerCase()];
    let itemsOrdered;

    try {
      itemsOrdered = JSON.parse(itemsOrderedString);
    } catch (error) {
      console.error("Error parsing items ordered:", error);
      displayArea.innerHTML += "<p>Error parsing items ordered. Please check the data.</p>";
      return;
    }

    if (Array.isArray(itemsOrdered)) {
      displayArea.innerHTML += "<h3>Items Ordered:</h3>";
      itemsOrdered.forEach((item) => {
        displayArea.innerHTML += `<p>Item Name: ${item.itemName}, Quantity: ${item.quantity}, Note: ${item.note}, Dine In: ${item.dineIn}</p>`;
      });
    } else {
      displayArea.innerHTML += "<p>No items ordered.</p>";
    }

    displayArea.innerHTML += `
      <div class="order-buttons">
        <button class="accept-btn">Accept Order</button>
        <button class="reject-btn">Reject Order</button>
        <button class="ready-btn">Order Ready</button>
      </div>
    `;
  }

  function displayOrders() {
    const buttonsContainer = document.getElementById("order-list");
    for (let i = 1; i <= 12; i++) {
      const button = document.createElement("button");
      button.textContent = `Table ${i}`;
      button.setAttribute("data-table-no", `Table-${i}`);
      button.classList.add("table-btn");
      button.onclick = function () {
        fetchOrderDetails(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  window.onload = displayOrders;

  document.getElementById("logout").addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
