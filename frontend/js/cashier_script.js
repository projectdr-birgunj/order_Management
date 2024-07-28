import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

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

  async function fetchOrders() {
    try {
      const dbRef = ref(database);
      const snapshot = await get(child(dbRef, "orders/"));
      let orders = snapshot.val();
      if (orders) {
        displayOrders(orders);
      } else {
        displayOrders(null);
      }
    } catch (error) {
      console.error("Error fetching data from Firebase:", error);
    }
  }

  function displayOrders(data) {
    const orderList = document.getElementById("order-list");
    orderList.innerHTML = "";

    if (data) {
      Object.entries(data).forEach(([orderId, orderDetails]) => {
        const orderButton = document.createElement("button");
        orderButton.textContent = `Order ID: ${orderId}`;
        orderButton.classList.add("order-button");
        orderButton.onclick = () => displayBillDetails(orderId, orderDetails);
        orderList.appendChild(orderButton);
      });
    } else {
      orderList.textContent = "No orders found.";
    }
  }

  function displayBillDetails(orderId, orderDetails) {
    const billItems = document.getElementById("bill-items");
    const billDate = document.getElementById("bill-date");

    billItems.innerHTML = "";

    const date = new Date().toLocaleDateString();
    billDate.textContent = `Date: ${date}`;

    let grandTotal = 0;

    if (orderDetails && orderDetails.order_detail) {
      Object.values(orderDetails.order_detail).forEach(order => {
        if (order && order.Table-1) {
          const itemList = JSON.parse(order.Table-1);
          if (itemList && Array.isArray(itemList)) {
            itemList.forEach((item) => {
              const itemRow = document.createElement("p");
              const unitPrice = 100; // Assuming a unit price of 100 for simplicity
              const totalPrice = item.quantity * unitPrice;
              grandTotal += totalPrice;
              itemRow.textContent = `${item.itemName} - Quantity: ${item.quantity} - Unit Price: $${unitPrice} - Total Price: $${totalPrice.toFixed(2)}`;
              billItems.appendChild(itemRow);
            });
          }
        }
      });
    }

    const tax = (grandTotal * 0.1).toFixed(2);
    const discount = (grandTotal * 0.05).toFixed(2); // Assuming a discount of 5%
    const finalTotal = (grandTotal + parseFloat(tax) - parseFloat(discount)).toFixed(2);

    document.getElementById("grand-total").textContent = grandTotal.toFixed(2);
    document.getElementById("tax").textContent = tax;
    document.getElementById("discount").textContent = discount;
    document.getElementById("final-total").textContent = finalTotal;
  }

  fetchOrders();

  document.getElementById("logout")?.addEventListener("click", function () {
    window.location.href = "index.html";
  });

  document.getElementById("generate-bill")?.addEventListener("click", function () {
    alert("Bill Generated!");
  });
});
