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
      timeStamp: "2024-07-28_11:10:11",
      custName: "Rajnish",
      waiterName: "Sumna",
      orderDetail: {
        [tableID]: [
          {
            itemName: "Biryani",
            quantity: "3",
            note: "Oily",
            dineIn: "Yes",
            chefStatus: -1,
          },
          {
            itemName: "Idli",
            quantity: "1",
            note: "Fishy",
            dineIn: "No",
            chefStatus: -1,
          },
        ],
      },
      tableClosed: "No",
      toBilling: "No",
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
    window.location.href = "index.html";
  });
});













<!-- dropdown menu code !-->
window.create_custom_dropdowns = function () {
  $("select").each(function (i, select) {
    if (!$(this).next().hasClass("dropdown-select")) {
      $(this).after(
        '<div class="dropdown-select wide ' +
          ($(this).attr("class") || "") +
          '" tabindex="0"><span class="current"></span><div class="list"><ul></ul></div></div>'
      );
      var dropdown = $(this).next();
      var options = $(select).find("option");
      var selected = $(this).find("option:selected");
      dropdown
        .find(".current")
        .html(selected.data("display-text") || selected.text());
      options.each(function (j, o) {
        var display = $(o).data("display-text") || "";
        dropdown
          .find("ul")
          .append(
            '<li class="option ' +
              ($(o).is(":selected") ? "selected" : "") +
              '" data-value="' +
              $(o).val() +
              '" data-display-text="' +
              display +
              '">' +
              $(o).text() +
              "</li>"
          );
      });
    }
  });

  $(".dropdown-select ul").before(
    '<div class="dd-search"><input id="txtSearchValue" autocomplete="off" onkeyup="filter()" class="dd-searchbox" type="text"></div>'
  );
};

// Event listeners

// Open/close
$(document).on("click", ".dropdown-select", function (event) {
  if ($(event.target).hasClass("dd-searchbox")) {
    return;
  }
  $(".dropdown-select").not($(this)).removeClass("open");
  $(this).toggleClass("open");
  if ($(this).hasClass("open")) {
    //jft
    var searchInput = $(this).find(".dd-searchbox");
    searchInput.val(""); // Clear the search input value
    var valThis = ""; // Empty search term to show all options
    $(this)
      .find(".dropdown-select ul > li")
      .each(function () {
        $(this).show(); // Show all options
      });
    //jft_ends
    console.log("checking tf this is when close is added");
    $(this).find(".option").attr("tabindex", 0);
    $(this).find(".selected").focus();
  } else {
    console.log("checking tf this is when close is removed");
    $(this).find(".option").removeAttr("tabindex");
    $(this).focus();
  }
});

// Close when clicking outside
$(document).on("click", function (event) {
  if ($(event.target).closest(".dropdown-select").length === 0) {
    $(".dropdown-select").removeClass("open");
    $(".dropdown-select .option").removeAttr("tabindex");
  }
  event.stopPropagation();
});

window.filter = function () {
  var valThis = $("#txtSearchValue").val().toLowerCase();
  console.log(valThis);
  $(".dropdown-select ul > li").each(function () {
    var text = $(this).text().toLowerCase();
    if (valThis === "" || text.indexOf(valThis) > -1) {
      $(this).show();
    } else {
      $(this).hide();
    }
  });
};
// Search

// Option click
$(document).on("click", ".dropdown-select .option", function (event) {
  $(this).closest(".list").find(".selected").removeClass("selected");
  $(this).addClass("selected");
  var text = $(this).data("display-text") || $(this).text();
  $(this).closest(".dropdown-select").find(".current").text(text);
  $(this)
    .closest(".dropdown-select")
    .prev("select")
    .val($(this).data("value"))
    .trigger("change");
});

// Keyboard events
$(document).on("keydown", ".dropdown-select", function (event) {
  var focused_option = $(
    $(this).find(".list .option:focus")[0] ||
      $(this).find(".list .option.selected")[0]
  );
  // Space or Enter
  //if (event.keyCode == 32 || event.keyCode == 13) {
  if (event.keyCode == 13) {
    if ($(this).hasClass("open")) {
      focused_option.trigger("click");
    } else {
      $(this).trigger("click");
    }
    return false;
    // Down
  } else if (event.keyCode == 40) {
    if (!$(this).hasClass("open")) {
      $(this).trigger("click");
    } else {
      focused_option.next().focus();
    }
    return false;
    // Up
  } else if (event.keyCode == 38) {
    if (!$(this).hasClass("open")) {
      $(this).trigger("click");
    } else {
      var focused_option = $(
        $(this).find(".list .option:focus")[0] ||
          $(this).find(".list .option.selected")[0]
      );
      focused_option.prev().focus();
    }
    return false;
    // Esc
  } else if (event.keyCode == 27) {
    if ($(this).hasClass("open")) {
      $(this).trigger("click");
    }
    return false;
  }
});

// Event listener for search input
$(document).on("keyup", "#txtSearchValue", function () {
  filter();
});

// $(document).ready(function () {
//     create_custom_dropdowns();
// });
