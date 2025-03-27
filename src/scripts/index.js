import { fetchProducts } from "../utils/api.js";
import { fetchCategories } from "../utils/api.js";

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();
});

// Ny funktion att filtrera produkter efter
async function loadProducts(category = null) {
  const productsContainer = document.getElementById("products");
  productsContainer.innerHTML = "<p>Laddar produkter...</p>";

  try {
    let products = await fetchProducts();

    //Om man väljer en kategori filtreras produkterna här
    if (category) {
      products = products.filter((products) => products.category === category);
    }

    productsContainer.innerHTML = "";

    if (products.length > 0) {
      products.forEach((product) => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
      });
    } else {
      productsContainer.innerHTML = "<p>Det finns inga </p>";
    }
  } catch (error) {
    console.log("Fel vid hämtning av produkter", error);
    productsContainer.innerHTML = "Det gick inte att ladda produkter.";
  }
}

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

// Länkar knapptryck till rätt kategori
async function loadCategories() {
  const categoriesContainer = document.getElementById("category-list");
  const categories = await fetchCategories();

  categories.forEach((cat) => {
    const categoryLi = document.createElement("li");
    categoryLi.textContent = cat.name;

    categoryLi.addEventListener("click", () => {
      loadProducts(cat.name);
    });
    categoriesContainer.appendChild(categoryLi);
  });

  //För att visa alla kategorierna
  const allCategoriesLi = document.createElement("li");
  allCategoriesLi.textContent = "Visa alla";
  allCategoriesLi.addEventListener("click", () => {
    loadProducts();
  });
  categoriesContainer.prepend(allCategoriesLi);
}

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

function createProductCard(product) {
  // Function to create an individual product card
  const element = document.createElement("div");
  element.className = "product-card";

  element.innerHTML = `
    <h3>${product.name}</h3>
    <p>$${product.price.toFixed(2)}</p>
    <button class="add-to-cart-btn">Add to Cart</button>
  `;

  element.querySelector(".add-to-cart-btn").addEventListener("click", () => {
    alert(`Adding ${product.name} to cart\nFunctionality not implemented yet`);
  });

  return element;
}
