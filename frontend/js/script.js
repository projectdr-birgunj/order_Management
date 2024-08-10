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

  // async function submitData() {
  //   const form = document.querySelector(".formTable tbody");
  //   const row1 = Array.from(form.rows);
  //   const data1 = [];

  //   row1.forEach((row) => {
  //     const itemNameInput = row.cells[0].querySelector('input[type="text"]');
  //     const quantityInput = row.cells[1].querySelector('input[type="number"]');
  //     const noteInput = row.cells[2].querySelector('input[type="text"]');
  //     const dineInInput = row.cells[3].querySelector('input[type="text"]');

  //     const itemName = itemNameInput ? itemNameInput.value.trim() : null;
  //     const quantity = quantityInput ? quantityInput.value.trim() : null;
  //     const note = noteInput ? noteInput.value.trim() : null;
  //     const dineIn = dineInInput ? dineInInput.value.trim() : null;
  //     console.log(
  //       "itemNameInput" +
  //         itemName +
  //         "\nquantityInput" +
  //         quantity +
  //         "\nnoteInput" +
  //         note +
  //         "\ndineInInput" +
  //         dineIn
  //     );
  //     const rowData = {
  //       itemName: itemName || null,
  //       quantity: quantity || null,
  //       note: note || null,
  //       dineIn: dineIn || null,
  //     };
  //     if (itemName || quantity || note || dineIn) {
  //       data1.push(rowData);
  //     }
  //   });

  // const orderId = document.getElementById("tableSelect").value;
  // let tableID = orderId.toLowerCase();
  // const data = { [tableID]: JSON.stringify(data1, null, 2) };
  // console.log("Data:" + data + "\ntableID" + tableID);

  //   try {
  //     //   const orderId = document.getElementById("tableSelect").value;
  //     if (orderId) {
  //       const reference = ref(database, "orders/" + orderId + "/order_detail/");
  //       await update(reference, data);
  //       alert("Orders submitted successfully!");
  //       location.reload(); // Reload the page
  //     } else {
  //       alert("Cannot fetch Order ID, Contact Developer");
  //     }
  //   } catch (error) {
  //     console.error("Error writing data to Firebase:", error);
  //     alert("Error submitting orders. Please try again.");
  //   }
  // }

  async function submitData() {
    const orderId = document.getElementById("tableSelect").value;
    const tableID = orderId.toLowerCase();
    const data = {
      tableClosed: "No",
      toBilling: "No",
      custName: "Rajnish",
      orderDetail: {
        [tableID]: [
          {
            chefStatus: 100,
            dineIn: "Yes",
            itemName: "Paneer Curry",
            note: "",
            quantity: 0,
          },
        ],
      },
      tableClosed: "No",
      timeStamp: "2024-07-28_11:10:11",
      toBilling: "No",
      waiterName: "Sumna",
    };

    // Push data to Firebase Realtime Database
    try {
      const orderId = document.getElementById("tableSelect").value;
      if (orderId) {
        const reference = ref(database, "orders/" + orderId);
        await set(reference, data);
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

  document
    .getElementById("fetchOrdersBtn")
    ?.addEventListener("click", async function () {
      try {
        const orderId = document.getElementById("tableSelect").value;
        const tableID = orderId.toLowerCase();
        console.log("Inside orderID if:", tableID);
        if (orderId) {
          console.log("Inside orderID if:", orderId);
          const dbRef = ref(database);
          const snapshot = await get(child(dbRef, "orders/" + orderId));
          let orders = snapshot.val();
          if (orders) {
            console.log("Inside orders if:", orders);
            const orderDetails = orders["order_detail"];
            var tableOneData = orderDetails[tableID]; // Accessing only the "Table-1" element
            console.log("tableOneData:\n:", tableOneData);
            console.log("orderDetails:\n", orderDetails);

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
              //   if (typeof orders === "string") {
              //     orders = JSON.parse(orders);
              //     console.log("The data is: ", orders);
              //   }
              displayJsonData(tableOneData);
            }
          } else {
            orders = null;
            displayJsonData(orders);
          }
        } else {
          alert("Cannot fetch Order ID, Contact Developer");
        }
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    });

  function displayJsonData(data) {
    console.log("Inside displayJson Data", data);
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
    table.appendChild(tbody);

    const hasData =
      data &&
      data.some((item) =>
        Object.values(item).some((value) => value.trim() !== "")
      );

    if (hasData) {
      data.forEach((item) => {
        const row = document.createElement("tr");

        Object.entries(item).forEach(([key, value], index) => {
          const td = document.createElement("td");
          const input = document.createElement("input");

          if (index === 1) {
            // Assuming the second column corresponds to the "quantity" field
            input.type = "number";
          } else {
            input.type = "text";
          }

          input.value = value;
          input.name = `${key}[]`;
          td.appendChild(input);
          row.appendChild(td);
        });

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
      submitData();
    });

    form.appendChild(table);
    form.appendChild(addRowBtn);
    form.appendChild(submitBtn);
    container.appendChild(form);
  }

  function addRow() {
    const table = document.querySelector(".formTable tbody");
    const newRow = table.insertRow();

    const itemCell = newRow.insertCell(0);
    itemCell.innerHTML = '<input type="text" name="item_name[]">';

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
    localStorage.removeItem("isLoggedIn");
    alert("You have been logged out.");
    window.location.href = "index.html";
  });
});
