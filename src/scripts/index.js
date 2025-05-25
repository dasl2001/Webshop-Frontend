import { fetchProducts, getBaseUrl } from "../utils/api.js";
import { fetchCategories } from "../utils/api.js";
import { addToCart } from "./cart.js";
import { formatPrice } from "../utils/utils.js";
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 10;
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
  initSearch();
  initSort();
});
async function loadProducts(category = null) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "<p>Laddar produkter...</p>";
  try {
    const products = await fetchProducts();
    allProducts = products;
    filteredProducts = category
      ? products.filter(
          (product) =>
            product.category && product.category.name === category.name
        )
      : products;
    if (filteredProducts.length > 0) {
      currentPage = 1;
      renderPaginatedProducts(filteredProducts, false);
      renderPagination(filteredProducts.length);
    } else {
      productsContainer.innerHTML = "<p>Inga produkter hittades.</p>";
    }
  } catch (error) {
    productsContainer.innerHTML = "Det gick inte att ladda produkter.";
  }
}
function renderPaginatedProducts(products, scrollToTop = true) {
  if (scrollToTop) {
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  }
  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const currentProducts = products.slice(start, end);
  renderProducts(currentProducts);
}
function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";
  products.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}
function renderPagination(totalProducts) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  if (totalPages <= 1) return;
  const createPageButton = (text, page = null, isActive = false) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.classList.add("pagination-button");
    if (isActive) btn.classList.add("active");
    if (page !== null) {
      btn.addEventListener("click", () => {
        currentPage = page;
        renderPaginatedProducts(filteredProducts);
        renderPagination(filteredProducts.length);
      });
    } else {
      btn.disabled = true;
    }
    return btn;
  };
  const prevBtn = createPageButton(
    "Föregående",
    currentPage > 1 ? currentPage - 1 : null
  );
  paginationContainer.appendChild(prevBtn);
  const maxVisible = 2;
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - maxVisible && i <= currentPage + maxVisible)
    ) {
      pages.push(i);
    } else if (
      (i === currentPage - maxVisible - 1 && i > 1) ||
      (i === currentPage + maxVisible + 1 && i < totalPages)
    ) {
      pages.push("...");
    }
  }
  let prevWasEllipsis = false;
  pages.forEach((page) => {
    if (page === "...") {
      if (!prevWasEllipsis) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";

