import { getCart, calculateTotal } from "./cart.js";

document.addEventListener("DOMContentLoaded", () => {
  const totalDisplay = document.getElementById("checkout-total");
  const cart = getCart();
  const initialTotal = calculateTotal(cart);

  // Visar totalsumman direkt
  totalDisplay.textContent = `${initialTotal.toFixed(2).replace(".", ",")} kr`;

  const form = document.getElementById("checkout-form");
  const popup = document.getElementById("confirmation-popup");
  const message = document.getElementById("confirmation-message");
  const closeBtn = document.getElementById("close-popup");
  const phoneInput = document.getElementById("phone");

  // Tillåt endast siffror i telefonfältet
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = form.name.value.trim();
    const address = form.address.value.trim();

    if (!name || !address) {
      alert("Fyll i både namn och adress.");
      return;
    }

    const currentTotal = calculateTotal(getCart());

    message.innerHTML = `
      Beställningen är mottagen!<br>
      Vänligen swisha <strong>${currentTotal.toFixed(2).replace(".", ",")} kr</strong> till <strong>123 456 676</strong>.<br>
      Vi sms:ar när vi är på väg.
    `;
    popup.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    localStorage.removeItem("cart");
    popup.classList.add("hidden");
    window.location.href = "/index.html";
  });
});
