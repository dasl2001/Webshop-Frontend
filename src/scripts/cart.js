import { formatPrice } from "../utils/utils.js";
const cartLink = document.querySelector('a[href="/pages/cart.html"]');
const cartPanel = document.getElementById("cart-offcanvas");
if (cartLink && cartPanel) {
  cartLink.addEventListener("click", (e) => {
    e.preventDefault();
    cartPanel.classList.add("visible");
    cartPanel.classList.remove("hidden");
  });
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cart-item-actions")) return;
    if (
      cartPanel.classList.contains("visible") &&
      !cartPanel.contains(e.target) &&
      !cartLink.contains(e.target)
    ) {
      cartPanel.classList.remove("visible");
      cartPanel.classList.add("hidden");
    }
  });
}
export function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}
function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}
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
    const price = parseFloat(item.price);
    if (!isNaN(price)) {
      sum += price * item.quantity;
    }
    totalQuantity += item.quantity;
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name" data-id="${item._id}" style="cursor:pointer;color:#e30613;">${item.name}</p>
        <p>${formatPrice(price)} /st</p>
      </div>
      <div class="cart-item-actions">
        <button class="decrease-qty" data-id="${item._id}">–</button>
        <span>${item.quantity}</span>
        <button class="increase-qty" data-id="${item._id}">+</button>
        <button class="remove-item" data-id="${item._id}" title="Ta bort">🗑️</button>
      </div>
    `;
    container.appendChild(el);
  });
  total.textContent = formatPrice(sum);
  count.textContent = `(${totalQuantity})`;
  setupCartButtonEvents();
  document.querySelectorAll(".cart-item-name").forEach((nameEl) => {
    nameEl.addEventListener("click", () => {
      const productId = nameEl.dataset.id;
      const allProducts = JSON.parse(localStorage.getItem("allProducts") || "[]");
      const product = allProducts.find((p) => p._id === productId);
      if (product) {
        import("./index.js").then((module) => {
          module.showProductModal(product);
          cartPanel.classList.remove("visible");
          cartPanel.classList.add("hidden");
        });
      }
    });
  });
}
function setupCartButtonEvents() {
  document.querySelectorAll(".increase-qty").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const product = cart.find((p) => p._id === btn.dataset.id);
      if (product) {
        product.quantity += 1;
        saveCart(cart);
        updateCartUI();
      }
    });
  });
  document.querySelectorAll(".decrease-qty").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const product = cart.find((p) => p._id === btn.dataset.id);
      if (product && product.quantity > 1) {
        product.quantity -= 1;
        saveCart(cart);
        updateCartUI();
      }
    });
  });
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cart = getCart();
      const index = cart.findIndex((p) => p._id === btn.dataset.id);
      if (index !== -1) {
        cart.splice(index, 1);
        saveCart(cart);
        updateCartUI();
      }
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  updateCartUI();
});
export function calculateTotal(cart) {
  return cart.reduce((sum, item) => {
    const price = parseFloat(item.price);
    return !isNaN(price) ? sum + price * item.quantity : sum;
  }, 0);
}

