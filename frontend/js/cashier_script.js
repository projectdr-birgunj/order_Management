import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";
import { itemPrices } from "./item_price.js";

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

  async function displayOrders() {
    // Function to create buttons
    const buttonsContainer = document.getElementById("buttonsContainer");

    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "orders/"));
    let orders = snapshot.val();

    console.log("Orders: \n" + JSON.stringify(orders, null, 2));

    for (let i = 1; i <= 10; i++) {
      let tableKey = "Table-" + i;
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.classList.add("table-btn");

      console.log(
        "orders[tableKey].tableClosed: " + orders[tableKey].toBilling
      );

      if (orders) {
        if (!(orders[tableKey].toBilling === "true")) {
          // Disable the button if the table is closed
          button.classList.add("disabled-btn");
          button.disabled = true;
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }

      button.onclick = function () {
        const allButtons = document.querySelectorAll(".table-btn");
        allButtons.forEach((btn) => btn.classList.remove("active-btn"));
        console.log("Inside button clicked");
        // Add active class to the clicked button
        button.classList.add("active-btn");
        fetchOrders(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  window.onload = displayOrders;

  function displayBillDetails(order, orderId) {
    let billAmount = 0;
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
    const orderDetailsContainer = document.createElement("div");
    orderDetailsContainer.classList.add("orderDetailsContainer");
    displayArea.appendChild(h2Element);
    orderDetailsContainer.innerHTML += `<p>Customer Name: ${custName}</p>`;
    orderDetailsContainer.innerHTML += `<p>Table Closed: ${tableClosed}</p>`;
    orderDetailsContainer.innerHTML += `<p>Time Stamp: ${timeStamp}</p>`;
    // displayArea.innerHTML += `<p>To Billing: ${toBilling}</p>`;
    orderDetailsContainer.innerHTML += `<p>Waiter Name: ${waiterName}</p>`;
    displayArea.appendChild(orderDetailsContainer);

    // Create a table element
    const table = document.createElement("table");

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = [
      "Item Name",
      "Quantity",
      "Note",
      "Dine In",
      "Rate",
      "Price",
    ];
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

      const rateCell = document.createElement("td");
      rateCell.textContent = itemPrices[item.itemName] || 0;
      row.appendChild(rateCell);

      // Calculate the price and create a cell for it
      // Get the price from itemPrices based on item name
      const price = itemPrices[item.itemName] || 0; // Default to 0 if item not found
      const totalPrice = price * parseInt(item.quantity, 10); // Calculate total price

      billAmount += totalPrice;

      const priceCell = document.createElement("td");
      priceCell.textContent = `NRs. ${totalPrice.toFixed(2)}`; // Display price in fixed-point notation
      row.appendChild(priceCell);

      tbody.appendChild(row);
      table.appendChild(tbody);

      // Append the table to the container
      displayArea.appendChild(table);
    });

    // Display the gross amount
    displayArea.innerHTML += `<p>Gross Amount: NRs: ${billAmount}</p>`;

    // Create the discount input field
    const discountField = document.createElement("div");
    discountField.classList.add("discount-container");
    discountField.innerHTML =
      '<label for="discount" class="label_discountInput">Discount:</label> <input type="number" id="discount" class="discountInput" name="discount" placeholder="Enter Discount amount if any" required>';
    displayArea.appendChild(discountField);

    // Initialize a variable to store the discount value
    let discount_var = 0;

    // Get a reference to the input field
    const discountInput = document.getElementById("discount");

    // Create the "Payment" button
    const toPaymentBtn = document.createElement("button");
    toPaymentBtn.textContent = "Payment";
    toPaymentBtn.classList.add("payment-btn");
    toPaymentBtn.type = "button";

    // Add an event listener to the button to calculate the total amount
    toPaymentBtn.addEventListener("click", function () {
      // Get the discount value from the input field
      discount_var = parseFloat(discountInput.value) || 0; // Parse the input value to a number, default to 0 if invalid

      // Calculate the total amount after applying the discount
      const totalAmount = billAmount - discount_var;

      // Display the total amount
      displayArea.innerHTML += `<p>Total Amount: NRs: ${totalAmount}</p>`;

      // Additional logic for payment processing can be added here
      console.log("Proceeding to payment with total amount:", totalAmount);
      toPaymentDetails(button);
    });

    // Append the payment button to the display area
    displayArea.appendChild(toPaymentBtn);
  }

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
