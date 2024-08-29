import {
  database,
  auth,
  db,
  itemPrices,
  itemNames,
  onAuthStateChanged,
  signOut,
  ref,
  update,
  get,
  child,
  doc,
  getDoc,
} from "../js/commonUtilityMgr.js";

let waiterNamePlaceHolder;

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded and parsed");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("User Role = " + userData.role);
          waiterNamePlaceHolder = userData.name;
          if (waiterNamePlaceHolder == null) {
            waiterNamePlaceHolder = "Not available";
          }
          if (userData.role === "waiter") {
            // Ensure the role matches what you have in Firestore
            document.body.style.display = "block"; // Show the content
            createButtons(); // Call createButtons now that the user is authenticated
          } else {
            //console.log("User Role = " + userData.role + "but not waiter");
            window.location.href = "login.html"; // Redirect if the role is not Waiter
          }
        } else {
          console.error("No such user document!");
          window.location.href = "login.html"; // Redirect if no user document is found
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        window.location.href = "login.html"; // Redirect on error
      }
    } else {
      window.location.href = "login.html"; // Redirect if not signed in
    }
  });

  function logout() {
    console.log("Logout called");
    signOut(auth)
      .then(() => {
        console.log("Logout called");
        // window.location.href = "login.html"; // Redirect to login page after successful logout
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }
  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", logout);

  // Function to create buttons
  async function createButtons() {
    const buttonsContainer = document.getElementById("buttonsContainer");

    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, "orders/"));
    let orders = snapshot.val();

    for (let i = 1; i <= 10; i++) {
      let tableKey = "Table-" + i;
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.classList.add("table-btn");

      if (orders) {
        if (!(orders[tableKey].toBilling === false)) {
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
        // Add active class to the clicked button
        button.classList.add("active-btn");
        fetchOrdersBtn(button);
      };
      buttonsContainer.appendChild(button);
    }
  }

  // Create buttons when the page loads
  // window.onload = createButtons;

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
    const orderId = button.getAttribute("data-table-no");
    const tableID = orderId.toLowerCase();
    let chefStatuses;
    if (orderId) {
      // console.log("Inside orderID if:", orderId);
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "orders/" + orderId));
      let orders = snapshot.val();
      if (orders) {
        // console.log("Inside orders if:", orders);
        const orderDetails = orders["orderDetail"];
        var tableOneData = orderDetails[tableID];
        chefStatuses = tableOneData.map((order) => order.chefStatus);
      }
    }

    const form = document.querySelector(".formTable tbody");
    const row1 = Array.from(form.rows);
    const data1 = {};
    let i = 0;

    row1.forEach((row) => {
      const itemName = row.cells[0].querySelector(
        'select[name="itemName[]"]'
      ).value;
      const quantityInput = row.cells[1].querySelector('input[type="number"]');
      const noteInput = row.cells[2].querySelector('input[type="text"]');
      const dineInInput = row.cells[3].querySelector('input[type="text"]');
      console.log(itemName);
      //   const itemName = itemNameInput ? itemNameInput.value.trim() : null;
      // console.log("itemName" + itemName);
      const quantity = quantityInput ? Number(quantityInput.value.trim()) : 0;
      const note = noteInput ? noteInput.value.trim() : "_";
      const dineIn = dineInInput ? dineInInput.value.trim() : null;
      const chefStatus = chefStatuses[i];
      const rate = itemPrices[itemName] || 0;
      i++;
      // console.log(
      //   "itemNameInput" +
      //     itemName +
      //     "\nquantityInput" +
      //     quantity +
      //     "\nnoteInput" +
      //     note +
      //     "\ndineInInput" +
      //     dineIn +
      //     "\nchefStatus" +
      //     chefStatus
      // );
      const rowData = {
        itemName: itemName || null,
        quantity: quantity,
        note: note || null,
        dineIn: dineIn || null,
        chefStatus: chefStatus !== undefined ? chefStatus : 100,
        rate: rate !== 0 ? rate : 0,
      };

      // console.log("Waiter Name +" + waiterName);
      // console.log(`Row Data ${Object.keys(data1).length}:`, rowData); // Logs with current index

      // Store rowData in data1 object with numeric keys
      data1[Object.keys(data1).length] = rowData; // Assign using the current length of the object as key
    });

    // Final output of data1 to show the object structure
    // console.log("Final data1:", data1);

    const data = { [tableID]: data1 };
    const waiterNameVar = {
      waiterName: JSON.stringify(waiterNamePlaceHolder, null, 2),
    };
    // console.log("Data:" + data + "\ntableID" + tableID);

    try {
      if (orderId) {
        const reference = ref(database, "orders/" + orderId + "/orderDetail/");
        const waiterNameRef = ref(database, "orders/" + orderId);
        const notificationRef = ref(database, "notifications");
        await update(reference, data);
        await update(waiterNameRef, waiterNameVar);
        await update(notificationRef, {
          tableNo: orderId,
          message: `A new order has been placed for ${orderId}!`,
          timestamp: Date.now(),
        });
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
    const data = { toBilling: true };
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
        const notificationRef = ref(database, "notificationsToCashier");
        await update(notificationRef, {
          tableNo: orderId,
          message: `Bill Generated for ${orderId}!`,
          timestamp: Date.now(),
        });
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

          const chefStatuses = tableOneData.map((order) => order.chefStatus);
          console.log(chefStatuses[1]); // Output: [-1, -1]

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
    let accept_billing = false;
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

    const headers = [
      "Item Name",
      "Quantity",
      "Note",
      "Dine-In",
      "Status",
      "Action",
    ];
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((headerText, index) => {
      const th = document.createElement("th");
      th.textContent = headerText;
      th.className = `header-cell-${index + 1}`;
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
      // console.log("Inside Has Data" + data);
      data.forEach((item) => {
        console.log("Printing items: ", item);
        const row = document.createElement("tr");

        const itemNameCell = document.createElement("td");
        const itemNameSelect = document.createElement("select");
        itemNameSelect.name = "itemName[]";
        itemNameSelect.className = "item-name";

        itemNames.forEach((optionName) => {
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
        quantityInput.required = true;
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
        quantityInput.required = true;
        dineInCell.appendChild(dineInInput);
        row.appendChild(dineInCell);

        const statusCell = document.createElement("td");
        const statusBtn = document.createElement("button");

        // Determine the button text based on the value of statusValue;
        switch (item.chefStatus) {
          case -1:
            statusBtn.textContent = "Preparing";
            statusBtn.style.backgroundColor = "#ffcc00";
            accept_billing = false;
            break;
          case 100:
            statusBtn.textContent = "Not Started";
            statusBtn.style.backgroundColor = "#7f8c8d";
            accept_billing = false;
            break;
          case 0:
            statusBtn.textContent = "Cooked";
            statusBtn.style.backgroundColor = "#00cc66";
            accept_billing = false;
            break;
          case 1:
            statusBtn.textContent = "Delivered";
            statusBtn.style.backgroundColor = "#3399ff";
            accept_billing = true;
            break;
          default:
            statusBtn.textContent = "Unknown Status"; // Optional: handle unexpected values
        }
        statusBtn.classList.add("statusBtn");
        statusBtn.disabled = true;
        statusCell.appendChild(statusBtn);
        statusBtn.style.color = "#fff";
        row.appendChild(statusCell);

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
      quantityCell.innerHTML =
        '<input type="number" name="quantity[]" required>';
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
    addRowBtn.classList.add("form-btn");
    addRowBtn.classList.add("addRowBtn");
    addRowBtn.type = "button";
    addRowBtn.addEventListener("click", function () {
      $(".dropdown-select .list .dd-search").remove();
      addRow();
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.classList.add("form-btn");
    submitBtn.classList.add("submitBtn");
    submitBtn.type = "button";
    submitBtn.addEventListener("click", function () {
      submitData(button);
    });

    const toBillingBtn = document.createElement("button");
    toBillingBtn.textContent = "To Billing";
    toBillingBtn.classList.add("form-btn");
    toBillingBtn.classList.add("toBillingBtn");
    toBillingBtn.type = "button";
    toBillingBtn.addEventListener("click", function () {
      if (accept_billing) {
        toBillingData(button);
      } else {
        // Show the popup
        showPopup(function () {
          toBillingData(button); // Call toBillingData if user clicks Yes
        });
      }
    });

    form.appendChild(table);
    form.appendChild(addRowBtn);
    form.appendChild(submitBtn);
    form.appendChild(toBillingBtn);
    container.appendChild(form);
    create_custom_dropdowns("item-name");
  }

  function addRow() {
    const table = document.querySelector(".formTable tbody");
    const newRow = table.insertRow();

    const itemCell = newRow.insertCell(0);
    const itemNameSelect = document.createElement("select");
    itemNameSelect.name = "itemName[]";
    itemNameSelect.className = "item-name";

    itemNames.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      // Set default selection
      if (item === "Dosa") option.selected = true;
      itemNameSelect.appendChild(option);
    });
    itemCell.appendChild(itemNameSelect);

    const quantityCell = newRow.insertCell(1);
    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.required = true;
    quantityInput.name = "quantity[]";
    quantityCell.appendChild(quantityInput);

    const noteCell = newRow.insertCell(2);
    const noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.name = "note[]";
    noteCell.appendChild(noteInput);

    const dineInCell = newRow.insertCell(3);
    const dineInInput = document.createElement("input");
    dineInInput.type = "text";
    dineInInput.name = "dineIn[]";
    dineInInput.value = "Yes";
    dineInInput.placeholder = "Yes"; // Placeholder for user guidance
    dineInCell.appendChild(dineInInput);

    const statusCell = newRow.insertCell(4);
    const statusBtn = document.createElement("button");
    statusBtn.textContent = "Not Started";
    statusBtn.classList.add("form-btn");
    statusBtn.value = 100;
    statusBtn.type = "button";
    statusBtn.style.backgroundColor = "#7f8c8d";
    statusCell.appendChild(statusBtn);

    const actionCell = newRow.insertCell(5);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("deleteRowBtn");
    deleteBtn.type = "button";
    deleteBtn.addEventListener("click", () => newRow.remove()); // Use arrow function for cleaner syntax
    actionCell.appendChild(deleteBtn);
    create_custom_dropdowns("item-name");
  }

  function showPopup(callback) {
    // Show overlay and popup
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";

    // Yes button action
    document.getElementById("yesBtn").onclick = function () {
      callback(); // Call the passed function
      hidePopup(); // Hide the popup after clicking Yes
    };

    // No button action
    document.getElementById("noBtn").onclick = function () {
      hidePopup(); // Just hide the popup on No
    };
  }

  function hidePopup() {
    // Hide overlay and popup
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
  }
});
