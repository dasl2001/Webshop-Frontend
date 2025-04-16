// import { getCart, calculateTotal } from "./cart.js";
// import { getBaseUrl } from "../utils/api.js";
// import { formatPrice } from "../utils/utils.js";

// document.addEventListener("DOMContentLoaded", () => {
//   const cart = getCart();

//   if (!cart.length) {
//     alert("Din varukorg är tom! Lägg till produkter innan du går till kassan.");
//     window.location.href = "/pages/cart.html";
//     return;
//   }

//   const totalDisplay = document.getElementById("checkout-total");
//   const initialTotal = calculateTotal(cart);

//   totalDisplay.textContent = `${formatPrice(initialTotal)}`;

//   const form = document.getElementById("checkout-form");
//   const popup = document.getElementById("confirmation-popup");
//   const message = document.getElementById("confirmation-message");
//   const closeBtn = document.getElementById("close-popup");
//   const phoneInput = document.getElementById("phone");

//   if (phoneInput) {
//     phoneInput.addEventListener("input", () => {
//       phoneInput.value = phoneInput.value.replace(/\D/g, "");
//     });
//   }

//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const name = form.name.value.trim();
//     const address = form.address.value.trim();
//     const phone = form.phone.value.trim();
//     const cart = getCart();

//     if (!name || !address) {
//       alert("Fyll i både namn och adress.");
//       return;
//     }

//     const products = cart.map((item) => ({
//       product: item._id,
//       quantity: item.quantity,
//     }));

//     const orderData = {
//       name,
//       address,
//       phone,
//       items: products,
//     };

//     console.log(
//       "Data som skickas till backend:",
//       JSON.stringify(orderData, null, 2),
//     );

//     try {
//       const res = await fetch(`${getBaseUrl()}/api/orders`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(orderData),
//       });

//       if (!res.ok) throw new Error("Kunde inte skicka beställningen");

//       const currentTotal = calculateTotal(cart);

//       message.innerHTML = `
//         Beställningen är mottagen!<br>
//         Vänligen swisha <strong>${formatPrice(currentTotal)}</strong> till <strong>123 456 676</strong>.<br>
//         Vi sms:ar när vi är på väg.
//       `;

//       popup.classList.remove("hidden");
//       localStorage.removeItem("cart");
//     } catch (error) {
//       console.error("Fel vid beställning:", error);
//       alert("Kunde inte skicka beställningen, försök igen.");
//     }
//   });

//   closeBtn.addEventListener("click", () => {
//     localStorage.removeItem("cart");
//     popup.classList.add("hidden");
//     window.location.href = "/index.html";
//   });
// });

import { getCart, calculateTotal } from "./cart.js";
import { getBaseUrl } from "../utils/api.js";
import { formatPrice } from "../utils/utils.js";

document.addEventListener("DOMContentLoaded", () => {
  const cart = getCart();
  const submitBtn = document.querySelector('button[type="submit"]');

  if (!cart.length) {
    alert("Din varukorg är tom! Lägg till produkter innan du går till kassan.");
    window.location.href = "/"; // Uppdaterad URL till befintlig sida
    return;
  }

  const totalDisplay = document.getElementById("checkout-total");
  const initialTotal = calculateTotal(cart);
  totalDisplay.textContent = `${formatPrice(initialTotal)}`;

  const form = document.getElementById("checkout-form");
  const popup = document.getElementById("confirmation-popup");
  const message = document.getElementById("confirmation-message");
  const closeBtn = document.getElementById("close-popup");
  const phoneInput = document.getElementById("phone");

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });
  }

  // Förhindra siffror i namn, efternamn och postort
  ["name", "lastname", "city"].forEach((id) => {
    const input = document.getElementById(id);
    input.addEventListener("input", () => {
      input.value = input.value.replace(/[0-9]/g, "");
    });
  });

  // Förhindra bokstäver i postnummer
  const zipInput = document.getElementById("zipcode");
  zipInput.addEventListener("input", () => {
    zipInput.value = zipInput.value.replace(/\D/g, "");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = "Skickar beställning...";

    const name = form.name.value.trim();
    const lastname = form.lastname.value.trim();
    const address = form.address.value.trim();
    const zipcode = form.zipcode.value.trim();
    const city = form.city.value.trim();
    const phone = form.phone.value.trim();

    if (!name || !lastname || !address || !zipcode || !city) {
      alert("Fyll i alla obligatoriska fält.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Beställ";
      return;
    }

    const products = cart.map((item) => ({
      product: item._id,
      quantity: item.quantity,
    }));

    const orderData = {
      name: `${name} ${lastname}`,
      address: `${address}, ${zipcode} ${city}`,
      phone,
      items: products,
    };

    console.log(
      "Data som skickas till backend:",
      JSON.stringify(orderData, null, 2),
    );

    try {
      const res = await fetch(`${getBaseUrl()}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Kunde inte skicka beställningen");

      const currentTotal = calculateTotal(cart);
      message.innerHTML = `
        Beställningen är mottagen!<br>
        Vänligen swisha <strong>${formatPrice(currentTotal)}</strong> till <strong>123 456 676</strong>.<br>
        Vi sms:ar när vi är på väg.
      `;

      popup.classList.remove("hidden");
      localStorage.removeItem("cart");
    } catch (error) {
      console.error("Fel vid beställning:", error);
      alert("Kunde inte skicka beställningen, försök igen.");
      submitBtn.disabled = false;
      submitBtn.textContent = "Beställ";
    }
  });

  closeBtn.addEventListener("click", () => {
    localStorage.removeItem("cart");
    popup.classList.add("hidden");
    window.location.href = "/index.html";
  });
});
