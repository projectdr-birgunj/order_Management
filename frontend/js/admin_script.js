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
  deleteDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "../js/commonUtilityMgr.js";

document.addEventListener("DOMContentLoaded", () => {
  document
    .getElementById("chefStatusButton")
    .addEventListener("click", function () {
      // Call the createButtons function
      // Remove display: none to show the containers
      document.getElementById("buttonsContainer").classList.remove("hidden");
      document.getElementById("ordersContainer").classList.remove("hidden");
      document.getElementById("ordersHistoryContainer").classList.add("hidden");
      document.getElementById("changeItemContainer").classList.add("hidden");
      // Call the createButtons function
      createButtons();
    });

  document
    .getElementById("orderHistoryButton")
    .addEventListener("click", function () {
      document.getElementById("buttonsContainer").classList.add("hidden");
      document.getElementById("ordersContainer").classList.add("hidden");
      document
        .getElementById("ordersHistoryContainer")
        .classList.remove("hidden");
      document.getElementById("changeItemContainer").classList.add("hidden");
      displayOrderHistory();
    });

  document
    .getElementById("changeItemButton")
    .addEventListener("click", function () {
      document.getElementById("buttonsContainer").classList.add("hidden");
      document.getElementById("ordersContainer").classList.add("hidden");
      document.getElementById("ordersHistoryContainer").classList.add("hidden");
      document.getElementById("changeItemContainer").classList.remove("hidden");
      displayChangeItem();
    });

  const collectionSelect = document.getElementById("collectionSelect");
  const dataDisplay = document.getElementById("dataDisplay");

  // Function to populate the select options with collection paths
  async function displayOrderHistory() {
    try {
      // Get all collections in the Firestore database
      const collectionsSnapshot = await getDocs(collection(db, "orders"));
      if (collectionsSnapshot.empty) {
        console.log("No documents in 'orders' collection.");
        return;
      }
      collectionsSnapshot.forEach((doc) => {
        // Create an option element for each collection
        const option = document.createElement("option");
        option.value = doc.id; // Set the collection path as the option value
        option.text = doc.id; // Set the collection path as the option text
        collectionSelect.add(option);
      });
    } catch (error) {
      console.error("Error getting collections: ", error);
    }
  }

  // Function to fetch and display data from the selected collection
  async function displayCollectionData() {
    const selectedCollectionPath = collectionSelect.value;

    try {
      const collectionRef = collection(db, `orders/${selectedCollectionPath}`);
      const querySnapshot = await getDocs(collectionRef);

      // Clear previous data display
      dataDisplay.innerHTML = "";

      // Display data for each document in the collection
      querySnapshot.forEach((doc) => {
        const documentData = doc.data();
        const documentId = doc.id;

        // Create a div to display document data
        const documentDiv = document.createElement("div");
        documentDiv.innerHTML = `
            <h3>Document ID: ${documentId}</h3>
            <pre>${JSON.stringify(documentData, null, 2)}</pre>
          `;
        dataDisplay.appendChild(documentDiv);
      });
    } catch (error) {
      console.error("Error getting documents: ", error);
    }
  }

  // Event listener for the select element
  collectionSelect.addEventListener("change", displayCollectionData);
  // Fetch all orders for Table-6 on 2024-08-11
  // async function displayOrderHistory() {
  //   console.log("Inside displayOrderHistory");
  //   const ordersContainer = document.getElementById("ordersHistoryContainer");

  //   // Clear existing content
  //   ordersContainer.innerHTML = "";

  // const docRef = doc(
  //   db,
  //   "orders/data_20240811/Table-6/Table-6_20240811_231703"
  // ); // Replace 'user123' with your document ID
  // console.log("Document path: ", docRef.path);

  //   try {
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists()) {
  //       console.log("Document data:", docSnap.data());

  //       const orderData = docSnap.data();

  //       // Create a new div element to hold the order information
  //       const orderDiv = document.createElement("div");
  //       orderDiv.classList.add("order-item");

  //       // Populate the div with order data
  //       orderDiv.innerHTML = `
  //         <p>Order ID: ${docRef.id}</p>
  //         <p>Customer Name: ${orderData.custName}</p>
  //         <p>Total Amount: $${orderData.totalAmount}</p>
  //       `;

  //       // Append the order div to the container
  //       ordersContainer.appendChild(orderDiv);
  //     } else {
  //       console.log("No such document!");
  //     }
  //   } catch (error) {
  //     console.error("Error getting document:", error);
  //   }
  // }

  async function createButtons() {
    const buttonsContainer = document.getElementById("buttonsContainer");
    buttonsContainer.innerHTML = "";

    // const dbRef = ref(database);
    // const snapshot = await get(child(dbRef, "orders/"));
    // let orders = snapshot.val();

    for (let i = 1; i <= 10; i++) {
      // let tableKey = "Table-" + i;
      const button = document.createElement("button");
      button.textContent = "Table " + i;
      button.setAttribute("data-table-no", "Table-" + i);
      button.classList.add("table-btn");

      // if (orders) {
      //   if (!(orders[tableKey].toBilling === true)) {
      //     // Disable the button if the table is not closed
      //     button.classList.add("disabled-btn");
      //     button.disabled = true;
      //   }
      // } else {
      //   alert("Cannot fetch Order ID, Contact Developer");
      // }

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

  async function fetchOrders(button) {
    try {
      const orderId = button.getAttribute("data-table-no");
      // console.log("Inside orderID if:", tableID);
      if (orderId) {
        // console.log("Inside orderID if:", orderId);
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, "orders/" + orderId));
        let order = snapshot.val();
        if (order) {
          // console.log("Inside orders if:", orders);
          // const to_billing_var = order["toBilling"];
          // console.log("to_billing", to_billing_var);
          // if (to_billing_var != "true") {
          //   alert("Table not cleared yet! Please wait");
          //   location.reload(); // Reload the page
          //   return;
          // } else if (to_billing_var == "true") {
          displayBillDetails(order, orderId, button);
          // }
          //  else {
          //   alert("This should not show. Please contact Developer!!");
          // }
        } else {
          order = null;
          displayBillDetails(order, orderId, button);
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayBillDetails(order, orderId, button) {
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
    const { custName, tableClosed, timeStamp, waiterName, toBilling } = order;
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

    tableOneData.forEach((item) => {
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
      rateCell.textContent = item.rate; //itemPrices[item.itemName] || 0;
      row.appendChild(rateCell);

      // Calculate the price and create a cell for it
      // Get the price from itemPrices based on item name
      const price = itemPrices[item.itemName] || 0; // Default to 0 if item not found
      const totalPrice = price * parseInt(item.quantity, 10); // Calculate total price

      billAmount += totalPrice;

      const priceCell = document.createElement("td");
      priceCell.textContent = `NRs. ${totalPrice.toFixed(2)}`; // Display price in fixed-point notation
      row.appendChild(priceCell);

      const toChefStatusChange = document.createElement("button");
      toChefStatusChange.id = "showPopupButton";
      toChefStatusChange.textContent = "Change Chef status to default";
      toChefStatusChange.classList.add("form-btn");
      toChefStatusChange.type = "button";
      toChefStatusChange.addEventListener("click", function () {
        showPopup(function () {
          toChefStatusChangeFn(orderId, item); // Call toBillingData if user clicks Yes
        });
      });

      const tobillingStatusChange = document.createElement("button");
      // console.log("toBilling value : " + toBilling);
      if (toBilling === false) {
        // console.log("Inside if toBilling value : " + toBilling);
        tobillingStatusChange.classList.add("disabled-btn");
        tobillingStatusChange.disabled = true;
      }
      tobillingStatusChange.id = "showPopupButton";
      tobillingStatusChange.textContent = "Billing Status to False";
      tobillingStatusChange.classList.add("form-btn");
      tobillingStatusChange.type = "button";
      tobillingStatusChange.addEventListener("click", function () {
        showPopup(function () {
          toBillingStatusChangeFn(button); // Call toBillingData if user clicks Yes
        });
      });

      row.appendChild(toChefStatusChange);
      row.appendChild(tobillingStatusChange);

      tbody.appendChild(row);
      table.appendChild(tbody);

      // Append the table to the container
      displayArea.appendChild(table);
    });
  }

  async function toBillingStatusChangeFn(button) {
    const to_billing_var = false;
    const orderId = button.getAttribute("data-table-no");
    const data = { toBilling: JSON.stringify(to_billing_var, null, 2) };
    console.log("Data:" + data);

    try {
      //   const orderId = document.getElementById("tableSelect").value;
      if (orderId) {
        const reference = ref(database, "orders/" + orderId);
        await update(reference, data);
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

  async function toChefStatusChangeFn(orderId, item) {
    const chefStatus = 100;
    const tableID = orderId.toLowerCase();

    try {
      if (orderId) {
        // Reference to the order details
        const orderRef = ref(
          database,
          `orders/${orderId}/orderDetail/${tableID}`
        );
        const snapshot = await get(orderRef);

        if (snapshot.exists()) {
          const orderDetails = snapshot.val();

          // Locate the index of the item you want to update
          const itemIndex = orderDetails.findIndex(
            (orderItem) =>
              orderItem.itemName === item.itemName &&
              orderItem.note === item.note &&
              orderItem.quantity === item.quantity
          );

          if (itemIndex !== -1) {
            // Update the chefStatus of the specific item
            const updates = {};
            updates[`${itemIndex}/chefStatus`] = chefStatus; // Update chefStatus for the specific index

            await update(orderRef, updates);
            alert("Order status updated successfully!");
          } else {
            console.log("Item not found for update.");
          }
        } else {
          alert("No order details found.");
        }
      } else {
        alert("Cannot fetch Order ID, Contact Developer");
      }
    } catch (error) {
      console.error("Error writing data to Firebase:", error);
      alert("Error updating order status. Please try again.");
    }
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

  // import { itemNames, itemPrices } from './yourFirebaseModule'; // Import item data from Firebase

  const changeItemContainer = document.getElementById("changeItemContainer");
  // const changeItemButton = document.getElementById("changeItemButton");
  const editButtonContainer = document.createElement("div");
  function displayChangeItem() {
    changeItemContainer.innerHTML = "";

    // Create Edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("form-btn");

    editButton.addEventListener("click", () => {
      editButtonContainer.className = "editButtonContainer";

      showDropdownAndRate("Edit", itemNames, itemPrices);
      // Create input fields for ItemName and ItemPrice
      const itemNameInput = document.createElement("input");
      itemNameInput.type = "text";
      itemNameInput.placeholder = "Enter Item Name";
      itemNameInput.classList.add("item-input");

      const itemPriceInput = document.createElement("input");
      itemPriceInput.type = "number";
      itemPriceInput.placeholder = "Enter Item Price";
      itemPriceInput.classList.add("item-input");

      const editSubmitButton = document.createElement("button");
      editSubmitButton.textContent = "Submit";
      editSubmitButton.classList.add("form-btn");

      // Append input fields to the container
      editButtonContainer.appendChild(itemNameInput);
      editButtonContainer.appendChild(itemPriceInput);
      editButtonContainer.appendChild(editSubmitButton);

      editSubmitButton.addEventListener("click", async () => {
        let itemName = itemNameInput.value.trim();
        let itemPrice = itemPriceInput.value;

        // Retrieve selected item and price from dropdown
        const selectItem = getSelectedValue();
        const price = itemPrices[selectItem];

        // Handle empty inputs
        if (!itemName) {
          itemName = selectItem;
        }
        if (!itemPrice) {
          itemPrice = price;
        }

        if (!itemName || !itemPrice) {
          // Show error if both inputs are empty
          alert("Error: Empty value received for Item Name or Item Price.");
        } else {
          // Update Firestore with the new or existing values
          try {
            // Check if the item name needs to be changed
            if (itemName !== selectItem) {
              // Create a new document with the new item name and price
              const newItemDocRef = doc(db, "itemPrices", itemName);
              await setDoc(newItemDocRef, {
                price: parseFloat(itemPrice),
              });

              console.log("New item document successfully created!");

              // Delete the old document
              const oldItemDocRef = doc(db, "itemPrices", selectItem);
              await deleteDoc(oldItemDocRef);

              console.log("Old item document successfully deleted!");

              // Update the `itemNames` array if the itemName was changed
              const itemNamesDocRef = doc(db, "itemNames", "names"); // Replace 'namesDocId' with the actual document ID

              await updateDoc(itemNamesDocRef, {
                names: arrayUnion(itemName),
              });

              await updateDoc(itemNamesDocRef, {
                names: arrayRemove(selectItem), // Remove old name
              });

              console.log("Item name successfully added to names array!");
              editButtonContainer.innerHTML = "";
            } else {
              // Update price if item name hasn't changed
              const itemPriceDocRef = doc(db, "itemPrices", itemName);
              await updateDoc(itemPriceDocRef, {
                price: parseFloat(itemPrice),
              });
              editButtonContainer.innerHTML = "";
            }
          } catch (error) {
            console.error("Error updating document: ", error);
          }
        }
      });

      // Initialize custom dropdowns
      create_custom_dropdowns("admin-item-name");
    });

    editButtonContainer.appendChild(editButton);

    // Create Delete button
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.classList.add("form-btn");
    deleteButton.addEventListener("click", () => {
      // Show dropdown menu and confirmation for deleting
      showDropdownAndConfirmation("Delete", itemNames);
      hideOtherButtons(deleteButton);
    });

    // Create Add button
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("form-btn");
    addButton.addEventListener("click", () => {
      // Show input fields for adding a new item
      showInputFields("Add");
      hideOtherButtons(addButton);
    });

    // Append buttons to container
    changeItemContainer.appendChild(editButton);
    changeItemContainer.appendChild(deleteButton);
    changeItemContainer.appendChild(addButton);
    changeItemContainer.appendChild(editButtonContainer);
  }

  function showDropdownAndRate() {
    const itemNameSelect = document.createElement("select");
    itemNameSelect.name = "itemName[]";
    itemNameSelect.className = "admin-item-name";

    itemNames.forEach((optionName) => {
      const option = document.createElement("option");
      option.value = optionName; // Set the value of the option
      option.textContent = optionName; // Set the text content of the option

      itemNameSelect.appendChild(option);
    });

    const p = document.createElement("p");
    p.className = "p-admin-item-name"; // Set the class for styling
    $(document).on("click", ".dropdown-select .option", function () {
      console.log("Inside event listener for dropdown");

      // Remove "selected" class from all <li> elements within .dropdown-select
      $(this).siblings().removeClass("selected");

      // Add "selected" class to the clicked <li>
      $(this).addClass("selected");

      // Retrieve and store the value of the newly selected <li>
      let selectItem = getSelectedValue();
      const price = itemPrices[selectItem];
      p.textContent = `Price: ${price}`;
    });

    editButtonContainer.appendChild(itemNameSelect);
    editButtonContainer.appendChild(p);
  }

  function getSelectedValue() {
    // Find the <li> element with the class "selected"
    const selectedLi = $(".dropdown-select").find("li.selected");

    // Get the value from the data-value attribute of the selected <li>
    const selectedValue = selectedLi.data("value");

    // Store the value in a variable
    var storedValue = selectedValue;

    // Log the value to verify
    console.log("Stored Value:", storedValue);

    // Return the stored value if needed
    return storedValue;
  }
});
