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

  const nextBtn = createPageButton(
    "Nästa",
    currentPage < totalPages ? currentPage + 1 : null,
  );
  paginationContainer.appendChild(nextBtn);
}

function createProductCard(product) {
  const element = document.createElement("div");
  element.className = "product-card";

  element.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.name}" class="product-image" />
    <h3>${product.name}</h3>
    <p>${formatPrice(product.price)}</p>
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

function showProductModal(product) {
  try {
    const description =
      product.description?.length > 500
        ? product.description.slice(0, 500) + "..."
        : product.description || "Ingen beskrivning tillgänglig.";

    // Grundläggande info
    document.getElementById("modal-title").textContent = product.name;
    document.getElementById("modal-description").textContent = description;
    document.getElementById("modal-category").textContent =
      ` ${product.category?.name || "Okänd"}`;
    document.getElementById("modal-price").textContent = formatPrice(
      product.price,
    );
    document.getElementById("modal-image").src = product.imageUrl;
    document.getElementById("modal-image").alt = product.name;

    //  UPPDELNING AV ATTRIBUT
    const comparePrice = { label: "Jämförpris", value: product.comparePrice };

    const infoAttributes = [
      { label: "Ursprungsland", value: product.originCountry },
      { label: "Leverantör", value: product.supplier },
      { label: "Varumärke", value: product.brand },
    ];

    const contentAttributes = [
      { label: "Innehållsförteckning", value: product.ingredients },
      { label: "Näringsvärde", value: product.nutrition },
    ];

    // Jämförpris - ovanför "Lägg i varukorg"
    document.getElementById("modal-compare-price").innerHTML = `
      <p><span class="attribute-label">${comparePrice.label}:</span> ${comparePrice.value || "Ej tillgängligt"}</p>
    `;

    // Info-sektion
    const infoContainer = document.getElementById("modal-info-attributes");
    infoContainer.innerHTML = "";
    infoAttributes.forEach((attr) => {
      const p = document.createElement("p");
      p.innerHTML = `<span class="attribute-label">${attr.label}:</span> ${attr.value || "Ej tillgängligt"}`;
      infoContainer.appendChild(p);
    });

    //  Innehållsförteckning / Näringsvärde
    const contentContainer = document.getElementById(
      "modal-content-attributes",
    );
    contentContainer.innerHTML = "";
    contentAttributes.forEach((attr) => {
      const p = document.createElement("p");
      p.innerHTML = `<span class="attribute-label">${attr.label}:</span> ${attr.value || "Ej tillgängligt"}`;
      contentContainer.appendChild(p);
    });

    // Köpknapp
    const addToCartBtn = document.getElementById("modal-add-to-cart-btn");
    addToCartBtn.onclick = () => {
      addToCart(product);
      document.getElementById("product-modal").classList.add("hidden");
    };

    // Visa modalen
    document.getElementById("product-modal").classList.remove("hidden");
  } catch (err) {
    console.error("Fel vid visning av produktmodal:", err);
  }
}
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("product-modal").classList.add("hidden");
});

// Stäng modal om man klickar utanför innehållet
document.getElementById("product-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("product-modal")) {
    document.getElementById("product-modal").classList.add("hidden");
  }
});

// Stäng modal med ESC-tangent
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.getElementById("product-modal").classList.add("hidden");
  }
});

async function loadCategories() {
  const categoriesContainer = document.getElementById("category-list");
  const categories = await fetchCategories();

  const allCategoriesLi = document.createElement("li");
  allCategoriesLi.textContent = "Visa alla";
  allCategoriesLi.classList.add("category-item");
  allCategoriesLi.addEventListener("click", () => {
    setActiveCategory(allCategoriesLi);
    loadProducts();
  });
  categoriesContainer.appendChild(allCategoriesLi);

  categories.forEach((cat) => {
    const categoryLi = document.createElement("li");
    categoryLi.textContent = cat.name;
    categoryLi.classList.add("category-item");

    categoryLi.addEventListener("click", () => {
      setActiveCategory(categoryLi);
      loadProducts(cat);
    });

    categoriesContainer.appendChild(categoryLi);
  });
}

function setActiveCategory(selectedLi) {
  document.querySelectorAll("#category-list li").forEach((li) => {
    li.classList.remove("active");
  });
  selectedLi.classList.add("active");
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

  document.addEventListener("click", (e) => {
    if (!sortToggle.contains(e.target) && !sortOptions.contains(e.target)) {
      sortOptions.classList.add("hidden");
    }
  });
}
export { showProductModal };
