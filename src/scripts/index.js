// Funktioner för att hämta produkter och kategorier
import { fetchProducts } from "../utils/api.js";
import { fetchCategories } from "../utils/api.js";

// Produkter vi får från servern sparas här
// eslint-disable-next-line no-unused-vars
let allProducts = [];

// När sidan laddas, körs dessa funktioner
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
});

// Hämta och visa produkter
async function loadProducts(category = null) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "<p>Laddar produkter...</p>";

  try {
    const products = await fetchProducts(); // Hämta alla produkter från databasen
    allProducts = products;

    // Om man klickat på en kategori, filtrera bara de som har den kategorin
    let filteredProducts = category
      ? products.filter((product) => product.category.name === category)
      : products;

    if (filteredProducts.length > 0) {
      renderProducts(filteredProducts);
    } else {
      productsContainer.innerHTML = "<p>Inga produkter hittades.</p>";
    }
  } catch (error) {
    console.log("Fel vid hämtning av produkter", error);
    productsContainer.innerHTML = "Det gick inte att ladda produkter.";
  }
}

// Visa produkter på sidan
function renderProducts(products) {
  const container = document.getElementById("products");
  container.innerHTML = "";

  products.forEach((product) => {
    const card = createProductCard(product);
    container.appendChild(card);
  });
}

// Skapa ett produktkort
function createProductCard(product) {
  const element = document.createElement("div");
  element.className = "product-card";

  element.innerHTML = `
    <h3>${product.name}</h3>
    <p>${product.price.toFixed(2).replace(".", ",")} kr</p>
    <button class="add-to-cart-btn">Lägg i varukorg</button>
  `;

  // När man klickar på hela kortet, visas popup med mer info
  element.addEventListener("click", () => {
    showProductModal(product);
  });

  // När man klickar på knappen ska inte popup visas
  element
    .querySelector(".add-to-cart-btn")
    .addEventListener("click", (event) => {
      event.stopPropagation(); // stoppar klicket från att bubbla upp
      alert(
        `Lägger till ${product.name} i varukorgen\n(Funktionen är inte klar än)`,
      );
    });

  return element;
}

// Visa popup med produktbeskrivning
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

  document.getElementById("product-modal").classList.remove("hidden");
}

// Stänger popup när man klickar på krysset
document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("product-modal").classList.add("hidden");
});

// Laddar kategorier och skapar klickfunktion för varje
async function loadCategories() {
  const categoriesContainer = document.getElementById("category-list");
  const categories = await fetchCategories();

  // Skapa "Visa alla"-kategori högst upp
  const allCategoriesLi = document.createElement("li");
  allCategoriesLi.textContent = "Visa alla";
  allCategoriesLi.addEventListener("click", () => {
    loadProducts(); // Ladda alla produkter igen
  });
  categoriesContainer.appendChild(allCategoriesLi);

  // Skapa en kategori-knapp för varje kategori i databasen
  categories.forEach((cat) => {
    const categoryLi = document.createElement("li");
    categoryLi.textContent = cat.name;

    // När man klickar på kategorin, filtreras produkterna
    categoryLi.addEventListener("click", () => {
      loadProducts(cat.name);
    });

    categoriesContainer.appendChild(categoryLi);
  });
}

// Original för produkter 2 sektioner nedan:
// ORIGINAL:
// Function to fetch and render products
// async function loadProducts() {
//   const productsContainer = document.getElementById("products");
//   productsContainer.innerHTML = "<p>Loading products...</p>";

//   try {
//     const products = await fetchProducts();
//     productsContainer.innerHTML = "";

//     if (products.length > 0) {
//       products.forEach((product) => {
//         const productCard = createProductCard(product);
//         productsContainer.appendChild(productCard);
//       });
//     } else {
//       productsContainer.innerHTML = "<p>No products available.</p>";
//     }
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     productsContainer.innerHTML = "<p>Failed to load products.</p>";
//   }
// }

// ORIGINAL:
// async function loadCategories() {
//   const categoriesContainer = document.getElementById("category-list");
//   const categories = await fetchCategories();

//   categories.forEach((cat) => {
//     const categoryLi = document.createElement("li");
//     categoryLi.textContent = cat.name;
//     categoriesContainer.appendChild(categoryLi);
//   });
// }
