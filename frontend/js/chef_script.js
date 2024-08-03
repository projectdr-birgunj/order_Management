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
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);

  async function fetchOrderDetails(button) {
    try {
      const orderID = button.getAttribute("data-table-no");
      const tableID = orderID.toLowerCase();
      if (orderID) {
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "orders/" + orderID));
        const order = snapshot.val();
        if (order) {
          console.log("Orders Details : " + order);
          const to_billing_var = order["toBilling"];
          console.log("to_billing", to_billing_var);
          if (to_billing_var == "true") {
            alert("Table Closed for Billing");
            location.reload(); // Reload the page
            return;
          }
          const orderDetails = order["orderDetail"];
          var tableOneData = orderDetails[tableID]; // Accessing only the "Table-1" element
          console.log("tableOneData details:\n", tableOneData);

          if (tableOneData) {
            // Check if the data is a string and parse it if necessary
            if (typeof tableOneData === "string") {
              console.log(
                "Inside typeof tableOneData === string\n\ntableOneData:\n:",
                tableOneData
              );
              tableOneData = JSON.parse(tableOneData);
            }
            console.log("Table-1 data:", tableOneData); // Log the fetched data
            displayOrderDetails(tableOneData, button, orderID);
          }
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

  function displayOrderDetails(orders, button, orderId) {
    // Get the container where the table will be inserted
    const container = document.getElementById("tableContainer");
    container.innerHTML = "";

    const h2Element = document.createElement("h2");
    h2Element.id = "orderIDHeader";
    h2Element.textContent = `Order Details for : ${orderId}`;
    container.appendChild(h2Element);

    // Create a table element
    const table = document.createElement("table");

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = ["Item Name", "Quantity", "Note", "Dine In", "Status"];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");

    orders.forEach((item) => {
      const row = document.createElement("tr");

      const itemNameCell = document.createElement("td");
      itemNameCell.textContent = item.itemName;
      row.appendChild(itemNameCell);

      const quantityCell = document.createElement("td");
      quantityCell.textContent = item.quantity;
      row.appendChild(quantityCell);

      const noteCell = document.createElement("td");
      noteCell.textContent = item.note;
      row.appendChild(noteCell);

      const dineInCell = document.createElement("td");
      dineInCell.textContent = item.dineIn;
      row.appendChild(dineInCell);

      // Create the status cell with buttons
      const statusCell = document.createElement("td");
      const statuses = [
        { label: "Preparing", value: -1 },
        { label: "Cooked", value: 0 },
        { label: "Delivered", value: 1 },
      ];

      statuses.forEach((status) => {
        const button = document.createElement("button");
        button.textContent = status.label;
        button.className = "status-btn " + status.label.toLowerCase();
        button.addEventListener("click", () => {
          handleStatusChange(status.value, item.itemName, button);
        });
        statusCell.appendChild(button);
      });
      row.appendChild(statusCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    // Append the table to the container
    container.appendChild(table);
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

  async function handleStatusChange(status_value, itemName, button) {
    const to_billing_var = true;
    const orderId = button.getAttribute("data-table-no");
    const data = { toBilling: JSON.stringify(to_billing_var, null, 2) };
    console.log("Data:" + data);

    try {
      //   const orderId = document.getElementById("tableSelect").value;
      if (orderId) {
        const reference = ref(database, "orders/" + orderId);
        await update(reference, data);
        await update(reference, timestamp_field);
        alert("Bill Generated. Plz visit cashier");
        location.reload(); // Reload the page
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error writing data to Firebase:", error);
      alert("Error submitting orders. Please try again.");
    }
  }

  window.onload = displayOrders;

  document.getElementById("logout")?.addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
