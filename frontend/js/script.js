import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
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

  document.getElementById("addRowBtn")?.addEventListener("click", function () {
    console.log("Add Row button clicked");
    const table = document.getElementById("formTable");
    const newRow = table.insertRow();
    const cell1 = newRow.insertCell(0);
    const cell2 = newRow.insertCell(1);
    const cell3 = newRow.insertCell(2);
    const cell4 = newRow.insertCell(3);
    const cell5 = newRow.insertCell(4);
    cell1.innerHTML = '<input type="text" name="item_name[]">';
    cell2.innerHTML = '<input type="number" name="quantity[]">';
    cell3.innerHTML = '<input type="text" name="note[]">';
    cell4.innerHTML =
      '<input type="text" name="dineIn[]" value="Yes" placeholder="Yes">';
    cell5.innerHTML =
      '<button type="button" class="deleteRowBtn">Delete</button>';
    cell5.querySelector(".deleteRowBtn").addEventListener("click", function () {
      table.deleteRow(newRow.rowIndex);
    });
  });

  document
    .getElementById("submit")
    ?.addEventListener("click", async function () {
      console.log("Submit button clicked");
      const form = document.getElementById("myForm");
      const rows = form.querySelectorAll("#formTable tr");
      const data1 = [];

      rows.forEach((row, index) => {
        if (index > 0) {
          const itemNameInput = row.querySelector('input[name="item_name[]"]');
          const quantityInput = row.querySelector('input[name="quantity[]"]');
          const noteInput = row.querySelector('input[name="note[]"]');
          const dineInInput = row.querySelector('input[name="dineIn[]"]');
          const itemName = itemNameInput ? itemNameInput.value.trim() : null;
          const quantity = quantityInput ? quantityInput.value.trim() : null;
          const note = noteInput ? noteInput.value.trim() : null;
          const dineIn = dineInInput ? dineInInput.value.trim() : null;
          const rowData = {
            itemName: itemName || null,
            quantity: quantity || null,
            note: note || null,
            dineIn: dineIn || null,
          };
          if (itemName || quantity || note || dineIn) {
            data1.push(rowData);
          }
        }
      });

      const data = JSON.stringify(data1, null, 2);
      console.log("Form Data in JSON format:", data);

      try {
        const orderId = prompt("Enter Order ID for item:");
        if (orderId) {
          const reference = ref(database, "orders/" + orderId);
          await set(reference, data);
          console.log(`Order ${orderId} submitted successfully`);
          alert("Orders submitted successfully!");
          form.reset();
        } else {
          console.log("Order ID not provided for item. Skipping.");
        }
      } catch (error) {
        console.error("Error writing data to Firebase:", error);
        alert("Error submitting orders. Please try again.");
      }
    });

  document
    .getElementById("fetchOrdersBtn")
    ?.addEventListener("click", async function () {
      console.log("Fetch Orders button clicked");
      try {
        const orderId = prompt("Enter Order ID for item:");
        if (orderId) {
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, "orders/" + orderId));
          let orders = snapshot.val();
          if (orders) {
            if (typeof orders === "string") {
              orders = JSON.parse(orders);
              console.log("The data is: ", orders);
            }
            displayJsonData(orders);
          } else {
            console.log("No data available");
          }
        } else {
          console.log("Order ID not provided.");
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    });

  function displayJsonData(data) {
    console.log("Display JSON data called");
    const container = document.getElementById("json-container");
    container.innerHTML = "";

    const form = document.createElement("form");
    form.id = "editForm";

    const table = document.createElement("table");
    table.classList.add("formTable");
    table.style.width = "100%";

    const headers = ["Item Name", "Quantity", "Note", "Dine-In", "Action"];
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((headerText) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    const hasData = data.some((item) =>
      Object.values(item).some((value) => value.trim() !== "")
    );

    if (hasData) {
      data.forEach((item, index) => {
        const row = document.createElement("tr");

        for (const [key, value] of Object.entries(item)) {
          const td = document.createElement("td");
          const input = document.createElement("input");
          input.type = "text";
          input.value = value;
          input.name = `${key}[]`;
          td.appendChild(input);
          row.appendChild(td);
        }

        const actionCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("deleteRowBtn");
        deleteBtn.type = "button";
        deleteBtn.addEventListener("click", function () {
          row.remove();
        });
        actionCell.appendChild(deleteBtn);
        row.appendChild(actionCell);

        tbody.appendChild(row);
      });
    }

    if (!hasData) {
      const blankRow = document.createElement("tr");

      headers.forEach(() => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.name = "blank[]";
        td.appendChild(input);
        blankRow.appendChild(td);
      });

      const actionCell = document.createElement("td");
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.classList.add("deleteRowBtn");
      deleteBtn.type = "button";
      deleteBtn.addEventListener("click", function () {
        blankRow.remove();
      });
      actionCell.appendChild(deleteBtn);
      blankRow.appendChild(actionCell);

      tbody.appendChild(blankRow);
    }

    table.appendChild(tbody);
    container.appendChild(table);
    container.appendChild(form);
  }
});
