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
        let order = snapshot.val();
        if (order) {
          // console.log("Inside orders if:", orders);
          const to_billing_var = order["toBilling"];
          // console.log("to_billing", to_billing_var);
          if (to_billing_var != "true") {
            alert("Table not cleared yet! Please wait");
            location.reload(); // Reload the page
            return;
          } else if (to_billing_var == "true") {
            displayBillDetails(order, orderId);
          } else {
            alert("This should not show. Please contact Developer!!");
          }
        } else {
          order = null;
          displayBillDetails(order, orderId);
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
    const buttonsContainer = document.getElementById("buttonsContainer");
    for (let i = 1; i <= 10; i++) {
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.classList.add("table-btn");
      button.onclick = function () {
        const allButtons = document.querySelectorAll(".table-btn");
        allButtons.forEach((btn) => btn.classList.remove("active-btn"));

        // Add active class to the clicked button
        button.classList.add("active-btn");
        fetchOrders(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  window.onload = displayOrders;

  function displayBillDetails(order, orderId) {
    const tableID = orderId.toLowerCase();
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
    }
    console.log("Table-1 data:", tableOneData); // Log the fetched data
    // Clear any existing content in the display area
    const displayArea = document.getElementById("ordersContainer");
    displayArea.innerHTML = ""; // Clear previous data

    if (!order) {
      displayArea.innerHTML = "<p>No orders found for this table.</p>";
      return;
    }

    // Display order details
    const { custName, tableClosed, timeStamp, waiterName } = order;
    // Display customer and order details
    const h2Element = document.createElement("h2");
    h2Element.id = "orderIDHeader";
    h2Element.textContent = `Order Details for : ${orderId}`;
    displayArea.appendChild(h2Element);
    displayArea.innerHTML += `<p>Customer Name: ${custName}</p>`;
    displayArea.innerHTML += `<p>Table Closed: ${tableClosed}</p>`;
    displayArea.innerHTML += `<p>Time Stamp: ${timeStamp}</p>`;
    // displayArea.innerHTML += `<p>To Billing: ${toBilling}</p>`;
    displayArea.innerHTML += `<p>Waiter Name: ${waiterName}</p>`;

    // Create a table element
    const table = document.createElement("table");

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = ["Item Name", "Quantity", "Note", "Dine In", "Price"];
    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create the table body
    const tbody = document.createElement("tbody");
    let pairCounter = 0; // Add this line

    tableOneData.forEach((item, index) => {
      // console.log("pairCounter vefore: " + pairCounter);
      const rowClass = pairCounter % 2 === 1 ? "second-pair" : "first-pair"; // Modified line
      // console.log("pairCounter after: " + pairCounter);
      const row = document.createElement("tr");
      row.className = rowClass; // Add this line

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

      // Calculate the price and create a cell for it
      const price = 100; // Assuming the price for each item is 100
      const totalPrice = price * parseInt(item.quantity, 10); // Calculate total price
      const priceCell = document.createElement("td");
      priceCell.textContent = `NRs. ${totalPrice.toFixed(2)}`; // Display price in fixed-point notation
      row.appendChild(priceCell);

      tbody.appendChild(row);
      table.appendChild(tbody);

      // Append the table to the container
      displayArea.appendChild(table);
    });

    // // Display items ordered
    // if (Array.isArray(itemsOrdered)) {
    //   displayArea.innerHTML += "<h3>Items Ordered:</h3>";
    //   itemsOrdered.forEach((item) => {
    //     displayArea.innerHTML += `<p>Item Name: ${item.itemName}, Quantity: ${item.quantity}, Note: ${item.note}, Dine In: ${item.dineIn}</p>`;
    //   });
    // } else {
    //   displayArea.innerHTML += "<p>No items ordered.</p>";
    // }
  }

  // Example HTML Structure
  // Make sure to add this in your HTML file
  // <div id="ordersContainer"></div>

  // Example of calling the function
  // displayOrders(exampleOrders, 'table1');

  // fetchOrders();

  document.getElementById("logout")?.addEventListener("click", function () {
    window.location.href = "index.html";
  });

  document
    .getElementById("generate-bill")
    ?.addEventListener("click", function () {
      alert("Bill Generated!");
    });
});
