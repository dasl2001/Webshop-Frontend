import { fetchProducts, getBaseUrl } from "../utils/api.js";
import { fetchCategories } from "../utils/api.js";
import { addToCart } from "./cart.js";

// Produktdata
// eslint-disable-next-line no-unused-vars
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

// Ladda produkter och visa dem med paginering
async function loadProducts(category = null) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "<p>Laddar produkter...</p>";

  try {
    const products = await fetchProducts();
    allProducts = products;

    console.log("Produkter:", allProducts);
    allProducts.forEach((p) => console.log(`${p.name}: ${p.image}`));

    products.forEach((p) => {
      if (!p.category) {
        console.warn("Produkt utan kategori:", p.name);
      }
    });

    filteredProducts = category
      ? products.filter(
          (product) =>
            product.category && product.category.name === category.name,
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
    console.log("Fel vid hämtning av produkter", error);
    productsContainer.innerHTML = "Det gick inte att ladda produkter.";
  }
}

// Rendera produkter för aktuell sida
function renderPaginatedProducts(products, scrollToTop = true) {
  if (scrollToTop) {
    document.getElementById("products").scrollIntoView({ behavior: "smooth" });
  }

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const currentProducts = products.slice(start, end);

  renderProducts(currentProducts);
}

// Rendera produkterna på sidan
function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

// Rendera pagineringsknappar
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

  // Föregående
  const prevBtn = createPageButton(
    "Föregående",
    currentPage > 1 ? currentPage - 1 : null,
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
        ellipsis.classList.add("pagination-ellipsis");
        paginationContainer.appendChild(ellipsis);
        prevWasEllipsis = true;
      }
    } else {
      paginationContainer.appendChild(
        createPageButton(page, page, page === currentPage),
      );
      prevWasEllipsis = false;
    }
  });

  // Nästa
  const nextBtn = createPageButton(
    "Nästa",
    currentPage < totalPages ? currentPage + 1 : null,
  );
  paginationContainer.appendChild(nextBtn);
}

// Skapa ett produktkort
function createProductCard(product) {
  const element = document.createElement("div");
  element.className = "product-card";

  element.innerHTML = `
  <img src="${product.imageUrl}" alt="${product.name}" class="product-image" />
  <h3>${product.name}</h3>
  <p>${product.price.toFixed(2).replace(".", ",")} kr</p>
  <button class="add-to-cart-btn">Lägg i varukorg</button>
`;

  element.addEventListener("click", () => {
    showProductModal(product);
  });

  element
    .querySelector(".add-to-cart-btn")
    .addEventListener("click", (event) => {
      event.stopPropagation();
      addToCart(product);
    });

  return element;
}

// Visa produkt i modal
function showProductModal(product) {
  const description =
    product.description.length > 500
      ? product.description.slice(0, 500) + "..."
      : product.description;

  document.getElementById("modal-title").textContent = product.name;
  document.getElementById("modal-description").textContent = description;
  document.getElementById("modal-category").textContent =
    `Kategori: ${product.category.name}`;
  document.getElementById("modal-price").textContent =
    `${product.price.toFixed(2).replace(".", ",")} kr`;
  document.getElementById("modal-image").src = product.imageUrl;
  document.getElementById("modal-image").alt = product.name;

  document.getElementById("product-modal").classList.remove("hidden");
}

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("product-modal").classList.add("hidden");
});

// Ladda kategorier
async function loadCategories() {
  const categoriesContainer = document.getElementById("category-list");
  const categories = await fetchCategories();

  const allCategoriesLi = document.createElement("li");
  allCategoriesLi.textContent = "Visa alla";
  allCategoriesLi.addEventListener("click", () => {
    loadProducts();
  });
  categoriesContainer.appendChild(allCategoriesLi);

  categories.forEach((cat) => {
    const categoryLi = document.createElement("li");
    categoryLi.textContent = cat.name;

    categoryLi.addEventListener("click", () => {
      loadProducts(cat);
    });

    categoriesContainer.appendChild(categoryLi);
  });
}

function initSearch() {
  const form = document.getElementById("search-form");
  const input = document.getElementById("search-input");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const query = input.value.trim();
    if (!query) return;

    const endpoint = `/api/products/search?q=${encodeURIComponent(query)}`;

    try {
      const response = await fetch(`${getBaseUrl()}${endpoint}`);

      if (!response.ok) {
        if (response.status === 404) {
          document.getElementById("products").innerHTML =
            "<p>Inga produkter hittades.</p>";
          document.getElementById("pagination").innerHTML = "";
          return;
        }
        throw new Error("Något gick fel vid hämtning av sökresultat");
      }

      const searchResults = await response.json();

      filteredProducts = searchResults;
      currentPage = 1;
      renderPaginatedProducts(filteredProducts, false);
      renderPagination(filteredProducts.length);
    } catch (error) {
      console.error("Sökningen misslyckades:", error);
      document.getElementById("products").innerHTML =
        "<p>Det gick inte att söka just nu.</p>";
    }
  });
}

function initSort() {
  const sortToggle = document.getElementById("sort-toggle");
  const sortOptions = document.getElementById("sort-options");

  sortToggle.addEventListener("click", () => {
    sortOptions.classList.toggle("hidden");
  });

  sortOptions.addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      const value = e.target.dataset.value;
      if (value === "asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (value === "desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
      }

      currentPage = 1;
      renderPaginatedProducts(filteredProducts, false);
      renderPagination(filteredProducts.length);
      sortOptions.classList.add("hidden");
    }
  });

  // Stäng dropdown om man klickar utanför
  document.addEventListener("click", (e) => {
    if (!sortToggle.contains(e.target) && !sortOptions.contains(e.target)) {
      sortOptions.classList.add("hidden");
    }
  });
}
