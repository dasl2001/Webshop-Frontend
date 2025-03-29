// Visa varukorg när man klickar på länken
const cartLink = document.querySelector('a[href="/pages/cart.html"]');
const cartPanel = document.getElementById("cart-offcanvas");

cartLink.addEventListener("click", (e) => {
  e.preventDefault();
  cartPanel.classList.add("visible");
  cartPanel.classList.remove("hidden");
});

// Klick utanför varukorgen för att stänga (valfritt)
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
