import {
  database,
  getUserUid,
  db,
  fetchItemNames,
  fetchItemPrices,
  checkUserRole,
  ref,
  update,
  get,
  child,
  doc,
  deleteDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove,
  showAlert,
  collection,
  logOut,
} from "../js/commonUtilityMgr.js";

let itemNames;
let itemPrices;
const userUID = getUserUid();
const userRole = localStorage.getItem("userRole");

document.addEventListener("DOMContentLoaded", () => {
  checkUserRole("admin", async (role) => {
    itemNames = await fetchItemNames();
    itemPrices = await fetchItemPrices();
  });

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", () => logOut(userUID, userRole));

  document
    .getElementById("chefStatusButton")
    .addEventListener("click", function () {
      document.getElementById("buttonsContainer").classList.remove("hidden");
      document.getElementById("ordersContainer").classList.remove("hidden");
      document.getElementById("ordersHistoryContainer").classList.add("hidden");
      document.getElementById("changeItemContainer").classList.add("hidden");
      document.getElementById("editUserListContainer").classList.add("hidden");
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
      document.getElementById("editUserListContainer").classList.add("hidden");
      displayOrderHistory();
    });

  document
    .getElementById("changeItemButton")
    .addEventListener("click", function () {
      document.getElementById("buttonsContainer").classList.add("hidden");
      document.getElementById("ordersContainer").classList.add("hidden");
      document.getElementById("ordersHistoryContainer").classList.add("hidden");
      document.getElementById("changeItemContainer").classList.remove("hidden");
      document.getElementById("editUserListContainer").classList.add("hidden");
      displayChangeItem();
    });

  document
    .getElementById("editUserListButton")
    .addEventListener("click", function () {
      document.getElementById("buttonsContainer").classList.add("hidden");
      document.getElementById("ordersContainer").classList.add("hidden");
      document.getElementById("ordersHistoryContainer").classList.add("hidden");
      document.getElementById("changeItemContainer").classList.add("hidden");
      document
        .getElementById("editUserListContainer")
        .classList.remove("hidden");
      displayEditUser();
    });

  const collectionSelect = document.getElementById("collectionSelect");
  const dataDisplay = document.getElementById("dataDisplay");

  // Function to populate the select options with collection paths
  async function displayOrderHistory() {
    try {
      console.log("orderHistoryButton: displayOrderHistory Entered");
      // Get all collections in the Firestore database
      const collectionsSnapshot = await getDocs(collection(db, "orders"));
      // if (collectionsSnapshot.empty) {
      //   console.log("No documents in 'orders' collection.");
      //   return;
      // }
      collectionsSnapshot.forEach((doc) => {
        console.log(`Order ID: ${doc.id}`, doc.data());
      });
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

  async function createButtons() {
    const buttonsContainer = document.getElementById("buttonsContainer");
    buttonsContainer.innerHTML = "";
    for (let i = 1; i <= 12; i++) {
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
          displayBillDetails(order, orderId, button);
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

    const { custName, tableClosed, timeStamp, waiterName, toBilling } = order;
    // Display customer and order details
    const h2Element = document.createElement("h2");
    h2Element.id = "orderIDHeader";
    h2Element.textContent = `Order Details for : ${orderId}`;

    const orderDetailsContainer = document.createElement("div");
    orderDetailsContainer.classList.add("orderDetailsContainer");

    displayArea.appendChild(h2Element);

    orderDetailsContainer.innerHTML += `<p>Customer Name: <span class="detail-value">${custName}</span></p>`;
    orderDetailsContainer.innerHTML += `<p>Table Closed: <span class="detail-value">${tableClosed}</span></p>`;
    orderDetailsContainer.innerHTML += `<p>Time Stamp: <span class="detail-value">${timeStamp}</span></p>`;
    orderDetailsContainer.innerHTML += `<p>Waiter Name: <span class="detail-value">${waiterName}</span></p>`;

    displayArea.appendChild(orderDetailsContainer);

    // Create a table element
    const table = document.createElement("table");
    table.classList.add("orderTable");

    // Create the table header
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    const headers = [
      "Item Name",
      "Quantity",
      // "Note",
      // "Dine In",
      // "Rate",
      "Price",
      "Chef Status",
      "Billing",
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

      // const noteCell = document.createElement("td");
      // noteCell.textContent = item.note;
      // row.appendChild(noteCell);

      // const dineInCell = document.createElement("td");
      // dineInCell.textContent = item.dineIn;
      // row.appendChild(dineInCell);

      // const rateCell = document.createElement("td");
      // rateCell.textContent = item.rate; //itemPrices[item.itemName] || 0;
      // row.appendChild(rateCell);

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
      toChefStatusChange.textContent = "Set Default";
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

      const chefCell = document.createElement("td");
      chefCell.appendChild(toChefStatusChange);

      const billingCell = document.createElement("td");
      billingCell.appendChild(tobillingStatusChange);

      row.appendChild(chefCell);
      row.appendChild(billingCell);

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

  const changeItemContainer = document.getElementById("changeItemContainer");
  const editButtonContainer = document.createElement("div");
  const deleteButtonContainer = document.createElement("div");
  const addButtonContainer = document.createElement("div");
  function displayChangeItem() {
    changeItemContainer.innerHTML = "";

    // Create Edit button
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.classList.add("form-btn");

    editButton.addEventListener("click", () => {
      clearAllContainers();
      editButtonContainer.className = "editButtonContainer";

      showDropdownAndRate(editButtonContainer);
      // Create input fields for ItemName and ItemPrice
      addItemPriceandItemNameTag(editButtonContainer);

      const editSubmitButton = document.createElement("button");
      editSubmitButton.textContent = "Submit";
      editSubmitButton.classList.add("form-btn");

      editButtonContainer.appendChild(editSubmitButton);

      editSubmitButton.addEventListener("click", async () => {
        let itemName = document.getElementById("itemNameInput").value.trim();
        let itemPrice = document.getElementById("itemPriceInput").value;
        itemPrice = parseFloat(itemPrice);

        // Retrieve selected item and price from dropdown
        const selectItem = getSelectedValue();
        const price = itemPrices[selectItem];

        if (!itemName && isNaN(itemPrice)) {
          // Show error if both inputs are empty
          showAlert(
            "Edit Item form Database",
            "Error: Empty value received for Item Name or Item Price.",
            false
          );
          console.log("JFT CHECK");
        } else {
          // Handle empty inputs
          if (!itemName) {
            itemName = selectItem;
          }
          if (!itemPrice) {
            itemPrice = price;
          }
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
            } else {
              // Update price if item name hasn't changed
              const itemPriceDocRef = doc(db, "itemPrices", itemName);
              await updateDoc(itemPriceDocRef, {
                price: parseFloat(itemPrice),
              });
            }
            showAlert(
              "Edit Item form Database",
              "Item '" +
                itemName +
                "' with price'" +
                itemPrice +
                "' Added Successfully"
            );
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
      clearAllContainers();
      console.log("On click for delete is called");
      // Show dropdown menu and confirmation for deleting
      showDropdownAndRate(deleteButtonContainer);

      const deleteSubmitButton = document.createElement("button");
      deleteSubmitButton.textContent = "Submit";
      deleteSubmitButton.classList.add("form-btn");

      deleteButtonContainer.appendChild(deleteSubmitButton);

      deleteSubmitButton.addEventListener("click", async () => {
        const selectItemName = getSelectedValue();
        // const selectItemPrice = itemPrices[selectItemName];
        const oldItemDocRef = doc(db, "itemPrices", selectItemName);
        await deleteDoc(oldItemDocRef);

        const itemNamesDocRef = doc(db, "itemNames", "names");
        await updateDoc(itemNamesDocRef, {
          names: arrayRemove(selectItemName), // Remove old name
        });

        showAlert(
          "Delete Item form Database",
          "Item '" + selectItemName + "' Deleted Successfully"
        );
      });

      create_custom_dropdowns("admin-item-name");
    });

    // Create Add button
    const addButton = document.createElement("button");
    addButton.textContent = "Add";
    addButton.classList.add("form-btn");
    addButton.addEventListener("click", () => {
      clearAllContainers();
      console.log("On click for add is called");
      // Show input fields for adding a new item
      addItemPriceandItemNameTag(addButtonContainer);
      // Submit Button and Handling
      const addSubmitButton = document.createElement("button");
      addSubmitButton.textContent = "Submit";
      addSubmitButton.classList.add("form-btn");

      addButtonContainer.appendChild(addSubmitButton);

      addSubmitButton.addEventListener("click", async () => {
        let itemName = document.getElementById("itemNameInput").value.trim();
        let itemPrice = document.getElementById("itemPriceInput").value;

        if (!itemName || !itemPrice) {
          alert("Error: Empty value received for Item Name or Item Price.");
        } else {
          await handleAddButtonClick(itemName, itemPrice, addButtonContainer);
        }
      });
    });

    // Append buttons to container
    changeItemContainer.appendChild(editButton);
    changeItemContainer.appendChild(deleteButton);
    changeItemContainer.appendChild(addButton);
    changeItemContainer.appendChild(editButtonContainer);
    changeItemContainer.appendChild(deleteButtonContainer);
    changeItemContainer.appendChild(addButtonContainer);
  }

  function addItemPriceandItemNameTag(containerVarName) {
    console.log("addItemPriceandItemNameTag is called" + containerVarName);
    const itemNameInput = document.createElement("input");
    itemNameInput.type = "text";
    itemNameInput.placeholder = "Enter Item Name";
    itemNameInput.classList.add("item-input");
    itemNameInput.id = "itemNameInput";

    const itemPriceInput = document.createElement("input");
    itemPriceInput.type = "number";
    itemPriceInput.placeholder = "Enter Item Price";
    itemPriceInput.classList.add("item-input");
    itemPriceInput.id = "itemPriceInput";

    // Append input fields to the container
    containerVarName.appendChild(itemNameInput);
    containerVarName.appendChild(itemPriceInput);
  }

  function showDropdownAndRate(containerVarName) {
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

    containerVarName.appendChild(itemNameSelect);
    containerVarName.appendChild(p);
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

  async function checkIfItemExists(itemName) {
    const docRef = doc(db, "itemPrices", itemName);
    const docSnap = await getDoc(docRef);
    return docSnap.exists(); // Returns true if the document exists
  }

  async function handleAddButtonClick(itemName, itemPrice, container) {
    try {
      const itemExists = await checkIfItemExists(itemName);

      if (itemExists) {
        alert("Item already exists! No changes made.");
      } else {
        // If item does not exist, add new item
        const newItemDocRef = doc(db, "itemPrices", itemName);
        await setDoc(newItemDocRef, {
          price: parseFloat(itemPrice),
        });

        const itemNamesDocRef = doc(db, "itemNames", "names"); // Replace 'namesDocId' with the actual document ID

        await updateDoc(itemNamesDocRef, {
          names: arrayUnion(itemName),
        });

        showAlert(
          "Item Added to Database",
          "Item '" +
            itemName +
            "' with price'" +
            itemPrice +
            "' Added Successfully"
        );
      }

      container.innerHTML = ""; // Clear the container after operation
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  function clearAllContainers() {
    editButtonContainer.innerHTML = "";
    deleteButtonContainer.innerHTML = "";
    addButtonContainer.innerHTML = "";
  }

  const editUserListContainer = document.getElementById(
    "editUserListContainer"
  );
  const registerUserContainer = document.createElement("div");
  const deleteUserContainer = document.createElement("div");

  function displayEditUser() {
    editUserListContainer.innerHTML = "";

    // Create Register button
    const registerUserButton = document.createElement("button");
    registerUserButton.textContent = "Register User";
    registerUserButton.classList.add("form-btn");

    // Create Edit User button
    const deleteUserButton = document.createElement("button");
    deleteUserButton.textContent = "Delete User";
    deleteUserButton.classList.add("form-btn");

    editUserListContainer.appendChild(registerUserButton);
    editUserListContainer.appendChild(deleteUserButton);

    registerUserButton.addEventListener("click", () => {
      // clearAllContainers();
    });

    deleteUserButton.addEventListener("click", () => {
      // clearAllContainers();

      // deleteUserContainer.classList = "deleteUserContainer";
      displayUserList();
    });
  }
  // Function to fetch all users and display their data
  async function displayUserList() {
    let userID;
    try {
      // Reference to the 'users' collection
      const usersRef = collection(db, "users");

      // Fetch all documents from the 'users' collection
      const querySnapshot = await getDocs(usersRef);

      // Check if any users exist
      if (querySnapshot.empty) {
        alert("This should never HIT!!! Contact Developer");
        console.log("No users found!");
        return;
      }

      let deleteUserContainer = document.getElementById("deleteUserContainer");
      if (!deleteUserContainer) {
        deleteUserContainer = document.createElement("div");
        deleteUserContainer.id = "deleteUserContainer";
        editUserListContainer.appendChild(deleteUserContainer);
      }

      let tableHTML = `
      <table class="user-list-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
    `;

      let userFound = false;

      // Iterate through each document in the 'users' collection
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        userID = doc.id;

        if (userData.mainUser === "Yes") {
          console.log(`Skipping Main user`);
          return; // Skip this user and move to the next iteration
        }
        userFound = true;
        const email = userData.email;
        const name = userData.name;
        const role = userData.role;

        console.log("Inside querySnapshot with userID: ", userID);

        // Add each user data as a row
        tableHTML += `
          <tr>
            <td data-label="Email">${email}</td>
            <td data-label="Name">${name}</td>
            <td data-label="Role">${role}</td>
            <td data-label="Delete">
              <button id="deleteUserButtonID" class="delete-btn table-responsive" data-user-id="${userID}">Delete</button>
            </td>
          </tr>
        `;
      });

      if (!userFound) {
        tableHTML = `<p>No user found</p>`;
      }

      tableHTML += `</tbody></table>`;

      // Insert the table HTML into the container
      deleteUserContainer.innerHTML = tableHTML;

      deleteUserContainer.addEventListener("click", (event) => {
        console.log("Get element by ID deleteUserButton called");
        if (event.target.classList.contains("delete-btn")) {
          const userId = event.target.dataset.userId;

          try {
            // Check if Android interface exists
            if (
              window.AndroidInterface &&
              typeof window.AndroidInterface.triggerCloudFunction === "function"
            ) {
              console.log("AndroidInterface is available, calling function...");
              window.AndroidInterface.triggerCloudFunction(userId);

              console.log(
                "AndroidInterface is available, after calling function..."
              );
              alert("User Deleted Successfully");
            } else {
              // Android interface not available
              alert("User Deletion UnSuccessfull");
              throw new Error(
                "Android interface not available or triggerCloudFunction not defined."
              );
            }
          } catch (error) {
            console.error("Error deleting user:", error);
          }
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function deleteUser(userID) {
    console.log("deleteUser Called");
    try {
      const userDocRef = doc(db, "users", userID); // Reference to the document
      console.log("User Document Reference:", userDocRef); // Print the reference
      await deleteDoc(userDocRef); // Delete the document
      console.log("User deleted successfully!");
      alert(`User with ID: ${userID} deleted successfully!`);
      // Reload the table after deletion
      displayUserList();
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user.");
    }
  }
});
