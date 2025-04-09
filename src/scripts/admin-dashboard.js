import { fetchProducts, createProduct, fetchCategories } from "../utils/api.js";

const productsPerPage = 10;
let currentPage = 1;
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.admin) {
    window.location.href = "/pages/login.html";
  }

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/pages/login.html";
  });

  const form = document.getElementById("add-product-form");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  document.getElementById("add-product-btn")?.addEventListener("click", () => {
    document.getElementById("add-product-section").classList.toggle("hidden");
    formTitle("Lägg till ny produkt");
    cancelBtn.classList.add("hidden");
    form.removeAttribute("data-editing-id");
    form.reset();
  });

  // Avbryt redigering
  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.removeAttribute("data-editing-id");
    document.getElementById("add-product-section").classList.add("hidden");
    formTitle("Lägg till ny produkt");
    cancelBtn.classList.add("hidden");
  });

  // Sökfunktion
  document.getElementById("admin-search")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allProducts.filter((product) =>
      product.name.toLowerCase().includes(query),
    );
    currentPage = 1;
    renderPaginatedProducts(filtered);
    renderPagination(filtered.length);
  });

  // Formuläret - spara (ny eller redigering)
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("new-name").value.trim();

    let price = parseFloat(
      document.getElementById("new-price").value.replace(",", "."),
    );
    const imageUrl = document.getElementById("new-image").value.trim();
    const category = document.getElementById("new-category").value;

    if (!name || isNaN(price) || !imageUrl || !category) {
      alert("Fyll i alla fält korrekt. T.ex. pris 12,00.");
      return;
    }

    const productData = { name, price, imageUrl, category };
    const editingId = form.dataset.editingId;

    try {
      if (editingId) {
        // PUT: uppdatera befintlig produkt
        const res = await fetch(
          `https://webshop-2025-be-g10-five.vercel.app/api/products/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(productData),
          },
        );
        if (!res.ok) throw new Error("Uppdatering misslyckades");
        await loadAdminProducts();
      } else {
        // POST: skapa ny produkt
        const created = await createProduct(productData);
        allProducts.push(created);
        renderPaginatedProducts(allProducts);
        renderPagination(allProducts.length);
      }

      form.reset();
      form.removeAttribute("data-editing-id");
      cancelBtn.classList.add("hidden");
      formTitle("Lägg till ny produkt");
      document.getElementById("add-product-section").classList.add("hidden");
    } catch (err) {
      console.error("Fel vid sparande:", err);
      alert("Det gick inte att spara ändringarna.");
    }
  });

  loadAdminProducts();
  loadCategories();
});

// Hämtar och renderar produkter
async function loadAdminProducts() {
  const container = document.getElementById("admin-product-list");
  container.innerHTML = "<p>Laddar produkter...</p>";

  try {
    allProducts = await fetchProducts();
    currentPage = 1;
    renderPaginatedProducts(allProducts);
    renderPagination(allProducts.length);
  } catch (error) {
    console.error("Kunde inte ladda produkter:", error);
    container.innerHTML = "<p>Kunde inte ladda produkter.</p>";
  }
}

function renderPaginatedProducts(products) {
  const container = document.getElementById("admin-product-list");
  container.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const end = start + productsPerPage;
  const pageProducts = products.slice(start, end);

  pageProducts.forEach((prod) => {
    container.appendChild(createAdminProductCard(prod));
  });

  addEditListeners();
  addDeleteListeners();
}

function renderPagination(totalProducts) {
  const paginationContainer =
    document.getElementById("pagination") || createPaginationContainer();
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
        renderPaginatedProducts(allProducts);
        renderPagination(allProducts.length);
      });
    } else {
      btn.disabled = true;
    }

    return btn;
  };

  // Skapa "Föregående"-knapp
  paginationContainer.appendChild(
    createPageButton("Föregående", currentPage > 1 ? currentPage - 1 : null),
  );

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

  paginationContainer.appendChild(
    createPageButton(
      "Nästa",
      currentPage < totalPages ? currentPage + 1 : null,
    ),
  );
}

function createPaginationContainer() {
  const section = document.querySelector(".product-list-section");
  const pagination = document.createElement("div");
  pagination.id = "pagination";
  pagination.className = "pagination-container";
  section.appendChild(pagination);
  return pagination;
}

async function loadCategories() {
  try {
    const cats = await fetchCategories();
    const select = document.getElementById("new-category");
    select.innerHTML = `<option value="">Välj kategori</option>`;
    cats.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat._id;
      option.textContent = cat.name;
      select.appendChild(option);
    });
    window._categories = cats;
  } catch (err) {
    console.error("Kunde inte ladda kategorier:", err);
  }
}

function createAdminProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // Visa pris med komma
  const price = product.price.toFixed(2).replace(".", ",");

  let cat = "Ingen kategori";
  if (product.category?.name) {
    cat = product.category.name;
  } else if (typeof product.category === "string") {
    const found = window._categories?.find((c) => c._id === product.category);
    if (found) cat = found.name;
  }

  card.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.name}">
    <h4>${product.name}</h4>
    <p>${price} kr</p>
    <p><strong>${cat}</strong></p>
    <div class="actions">
      <button class="edit" data-id="${product._id}">Redigera</button>
      <button class="delete" data-id="${product._id}">Ta bort</button>
    </div>
  `;
  return card;
}

function formTitle(text) {
  document.querySelector("#add-product-section h3").textContent = text;
}

function getCategoryIdByName(name) {
  return (
    window._categories?.find((c) => c.name.toLowerCase() === name.toLowerCase())
      ?._id || ""
  );
}

function addEditListeners() {
  const editButtons = document.querySelectorAll(".edit");
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const id = btn.dataset.id;
      const name = card.querySelector("h4").textContent;
      const price = parseFloat(
        card
          .querySelector("p")
          .textContent.replace(" kr", "")
          .replace(",", "."),
      );
      const image = card.querySelector("img").src;
      const categoryName = card.querySelector("strong").textContent;
      const categoryId = getCategoryIdByName(categoryName);

      document.getElementById("add-product-section").classList.remove("hidden");
      formTitle("Redigera produkt");
      document.getElementById("new-name").value = name;
      document.getElementById("new-price").value = price;
      document.getElementById("new-image").value = image;
      document.getElementById("new-category").value = categoryId;

      document.getElementById("add-product-form").dataset.editingId = id;
      document.getElementById("cancel-edit-btn").classList.remove("hidden");

      document
        .getElementById("add-product-section")
        .scrollIntoView({ behavior: "smooth" });
    });
  });
}

function addDeleteListeners() {
  const buttons = document.querySelectorAll(".delete");
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const confirmed = confirm(
        "Är du säker på att du vill radera denna produkt?",
      );
      if (!confirmed) return;

      try {
        const response = await fetch(
          `https://webshop-2025-be-g10-five.vercel.app/api/products/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        if (!response.ok) throw new Error("Radering misslyckades");
        await loadAdminProducts();
      } catch (err) {
        console.error("Fel vid radering:", err);
        alert("Produkten kunde inte raderas.");
      }
    });
  });
}
