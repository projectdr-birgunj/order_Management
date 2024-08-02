import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
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

  // Function to create buttons
  function createButtons() {
    const buttonsContainer = document.getElementById("buttonsContainer");
    for (let i = 1; i <= 10; i++) {
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.onclick = function () {
        fetchOrdersBtn(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  // Create buttons when the page loads
  window.onload = createButtons;

  // Function to add leading zeroes
  function pad(number) {
    return number < 10 ? "0" + number : number;
  }

  // Function to get the formatted timestamp
  function getFormattedTimestamp() {
    const now = new Date();

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1); // Months are zero-based
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${year}-${month}-${day}_${hours}:${minutes}:${seconds}`;
  }

  async function submitData(button) {
    const form = document.querySelector(".formTable tbody");
    const row1 = Array.from(form.rows);
    const data1 = [];

    row1.forEach((row) => {
      const itemName = row.cells[0].querySelector(
        'select[name="itemName[]"]'
      ).value;
      const quantityInput = row.cells[1].querySelector('input[type="number"]');
      const noteInput = row.cells[2].querySelector('input[type="text"]');
      const dineInInput = row.cells[3].querySelector('input[type="text"]');
      console.log(itemName);
      //   const itemName = itemNameInput ? itemNameInput.value.trim() : null;
      console.log("itemName" + itemName);
      const quantity = quantityInput ? quantityInput.value.trim() : null;
      const note = noteInput ? noteInput.value.trim() : null;
      const dineIn = dineInInput ? dineInInput.value.trim() : null;
      console.log(
        "itemNameInput" +
          itemName +
          "\nquantityInput" +
          quantity +
          "\nnoteInput" +
          note +
          "\ndineInInput" +
          dineIn
      );
      const rowData = {
        itemName: itemName || null,
        quantity: quantity || null,
        note: note || null,
        dineIn: dineIn || null,
      };
      if (itemName || quantity || note || dineIn) {
        data1.push(rowData);
      }
    });

    const orderId = button.getAttribute("data-table-no");
    const tableID = orderId.toLowerCase();
    const data = { [tableID]: JSON.stringify(data1, null, 2) };
    console.log("Data:" + data + "\ntableID" + tableID);

    try {
      //   const orderId = document.getElementById("tableSelect").value;
      if (orderId) {
        const reference = ref(database, "orders/" + orderId + "/orderDetail/");
        await update(reference, data);
        alert("Orders submitted successfully!");
        location.reload(); // Reload the page
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error writing data to Firebase:", error);
      alert("Error submitting orders. Please try again.");
    }
  }

  async function toBillingData(button) {
    const to_billing_var = true;
    const orderId = button.getAttribute("data-table-no");
    const data = { toBilling: JSON.stringify(to_billing_var, null, 2) };
    console.log("Data:" + data);

    // Store the timestamp in a variable
    const timestamp_var = getFormattedTimestamp();
    const timestamp_field = {
      timeStamp: timestamp_var, // Directly assign the formatted timestamp
    };
    console.log(timestamp_field); // Outputs: 2024-07-28_11:10:11 (or the current timestamp)

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

  async function fetchOrdersBtn(button) {
    try {
      const orderId = button.getAttribute("data-table-no");
      const tableID = orderId.toLowerCase();
      console.log("Inside orderID if:", tableID);
      if (orderId) {
        console.log("Inside orderID if:", orderId);
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "orders/" + orderId));
        let orders = snapshot.val();
        if (orders) {
          console.log("Inside orders if:", orders);
          const to_billing_var = orders["toBilling"];
          console.log("to_billing", to_billing_var);
          if (to_billing_var == "true") {
            alert("Please clear the table from Cashier's end");
            location.reload(); // Reload the page
            return;
          }
          const orderDetails = orders["orderDetail"];
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
            displayJsonData(tableOneData, button, orderId);
          }
        } else {
          orders = null;
          displayJsonData(orders, button, orderId);
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayJsonData(data, button, orderId) {
    console.log("Inside displayJson Data" + "Button:\t\n" + button);
    const container = document.getElementById("json-container");
    container.innerHTML = "";

    const h2Element = document.createElement("h2");
    h2Element.id = "orderIDHeader";
    h2Element.textContent = `Order Details for : ${orderId}`;
    container.appendChild(h2Element);

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
    table.appendChild(tbody);

    const hasData =
      data &&
      data.some((item) =>
        Object.values(item).some(
          (value) => typeof value === "string" && value.trim() !== ""
        )
      );

    if (hasData) {
      console.log("Inside Has Data" + data);
      data.forEach((item) => {
        console.log("Printing items: ", item);
        const row = document.createElement("tr");

        const itemNameCell = document.createElement("td");
        const itemNameSelect = document.createElement("select");
        itemNameSelect.name = "itemName[]";
        const items = [
          "Biryani",
          "Chicken Momo",
          "Shawarma",
          "Dosa",
          "Idli",
          "Gulab Jamun",
        ];
        items.forEach((optionName) => {
          const option = document.createElement("option");
          option.value = optionName; // Set the value of the option
          option.textContent = optionName; // Set the text content of the option

          // Set the selected attribute if this option matches the itemName
          if (optionName === item.itemName) {
            // Use item.itemName to check against the current item
            option.selected = true; // Mark the option as selected if it matches the item's itemName
          }

          itemNameSelect.appendChild(option);
        });
        itemNameCell.appendChild(itemNameSelect);
        row.appendChild(itemNameCell);

        const quantityCell = document.createElement("td");
        const quantityInput = document.createElement("input");
        quantityInput.type = "number";
        quantityInput.value = item.quantity;
        quantityInput.name = "quantity[]";
        quantityCell.appendChild(quantityInput);
        row.appendChild(quantityCell);

        const noteCell = document.createElement("td");
        const noteInput = document.createElement("input");
        noteInput.type = "text";
        noteInput.value = item.note;
        noteInput.name = "note[]";
        noteCell.appendChild(noteInput);
        row.appendChild(noteCell);

        const dineInCell = document.createElement("td");
        const dineInInput = document.createElement("input");
        dineInInput.type = "text";
        dineInInput.value = item.dineIn;
        dineInInput.name = "dineIn[]";
        dineInCell.appendChild(dineInInput);
        row.appendChild(dineInCell);

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
    } else {
      console.log("!hasData is called");
      const blankRow = document.createElement("tr");

      const itemCell = document.createElement("td");
      itemCell.innerHTML = '<input type="text" name="item_name[]">';
      blankRow.appendChild(itemCell);

      const quantityCell = document.createElement("td");
      quantityCell.innerHTML = '<input type="number" name="quantity[]">';
      blankRow.appendChild(quantityCell);

      const noteCell = document.createElement("td");
      noteCell.innerHTML = '<input type="text" name="note[]">';
      blankRow.appendChild(noteCell);

      const dineInCell = document.createElement("td");
      dineInCell.innerHTML =
        '<input type="text" name="dineIn[]" value="Yes" placeholder="Yes">';
      blankRow.appendChild(dineInCell);

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

    const addRowBtn = document.createElement("button");
    addRowBtn.textContent = "Add Row";
    addRowBtn.classList.add("addRowBtn");
    addRowBtn.type = "button";
    addRowBtn.addEventListener("click", function () {
      addRow();
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.classList.add("submitBtn");
    submitBtn.type = "button";
    submitBtn.addEventListener("click", function () {
      submitData(button);
    });

    const toBillingBtn = document.createElement("button");
    toBillingBtn.textContent = "To Billing";
    toBillingBtn.classList.add("toBillingBtn");
    toBillingBtn.type = "button";
    toBillingBtn.addEventListener("click", function () {
      toBillingData(button);
    });

    form.appendChild(table);
    form.appendChild(addRowBtn);
    form.appendChild(submitBtn);
    form.appendChild(toBillingBtn);
    container.appendChild(form);
  }

  function addRow() {
    const table = document.querySelector(".formTable tbody");
    const newRow = table.insertRow();

    const itemCell = newRow.insertCell(0);
    const items = [
      "Biryani",
      "Chicken Momo",
      "Shawarma",
      "Dosa",
      "Idli",
      "Gulab Jamun",
    ];

    let select = '<select name="itemName[]">';
    items.forEach((item) => {
      if (item === "Dosa") {
        select += `<option value="${item}" selected>${item}</option>`;
      } else {
        select += `<option value="${item}">${item}</option>`;
      }
    });
    select += "</select>";
    itemCell.innerHTML = select;

    const quantityCell = newRow.insertCell(1);
    quantityCell.innerHTML = '<input type="number" name="quantity[]">';

    const noteCell = newRow.insertCell(2);
    noteCell.innerHTML = '<input type="text" name="note[]">';

    const dineInCell = newRow.insertCell(3);
    dineInCell.innerHTML =
      '<input type="text" name="dineIn[]" value="Yes" placeholder="Yes">';

    const actionCell = newRow.insertCell(4);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("deleteRowBtn");
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", function () {
      newRow.remove();
    });
    actionCell.appendChild(deleteBtn);
  }

  document.getElementById("logout")?.addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
