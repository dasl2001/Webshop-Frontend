// Visar varukorgen när man trycker på den
const cartLink = document.querySelector('a[href="/pages/cart.html"]');
const cartPanel = document.getElementById("cart-offcanvas");

cartLink.addEventListener("click", (e) => {
  e.preventDefault();
  cartPanel.classList.add("visible");
  cartPanel.classList.remove("hidden");
});

// För att stänga varukorgen när man klickar utanför den
document.addEventListener("click", (e) => {
  if (
    cartPanel.classList.contains("visible") &&
    !cartPanel.contains(e.target) &&
    !cartLink.contains(e.target)
  ) {
    cartPanel.classList.remove("visible");
    cartPanel.classList.add("hidden");
  }
});

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Lägg till en produkt i varukorgen
export function addToCart(product) {
  const cart = getCart();
  const existingProduct = cart.find((item) => item._id === product._id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart(cart);
  updateCartUI();
}

// Uppdaterar varukorgs-panelen
export function updateCartUI() {
  const cart = getCart();
  const container = document.getElementById("cart-items");
  const total = document.getElementById("cart-total");
  const count = document.querySelector(".cart-count");

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Din varukorg är tom.</p>";
    total.textContent = "0 kr";
    count.textContent = "(0)";
    return;
  }

  let sum = 0;
  let totalQuantity = 0;

  cart.forEach((item) => {
    sum += item.price * item.quantity;
    totalQuantity += item.quantity;

    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <p>${item.name} (${item.quantity}) - 
         ${item.price.toFixed(2).replace(".", ",")} kr</p>
    `;
    container.appendChild(el);
  });

  total.textContent = `${sum.toFixed(2).replace(".", ",")} kr`;

  // Byt alltså till totalQuantity i stället för cart.length
  count.textContent = `(${totalQuantity})`;
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});
