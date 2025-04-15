import {
  fetchProducts,
  createProduct,
  fetchCategories,
  getBaseUrl,
} from "../utils/api.js";
import { formatPrice } from "../utils/utils.js";

const productsPerPage = 10;
let currentPage = 1;
let allProducts = [];
let allOrders = [];

document.addEventListener("DOMContentLoaded", async () => {
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
  const tabs = document.querySelectorAll(".tabs button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabContents.forEach((section) => section.classList.remove("active"));
  tabs[0].classList.add("active");
  tabContents[0].classList.add("active");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((section) => section.classList.remove("active"));

      tab.classList.add("active");
      const target = tab.dataset.tab;
      document.getElementById(target).classList.add("active");
    });
  });

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
    const description = document.getElementById("new-description").value.trim();
    const brand = document.getElementById("new-brand").value.trim();
    const comparePrice = document
      .getElementById("new-comparisonPrice")
      .value.trim();

    const originCountry = document
      .getElementById("new-originCountry")
      .value.trim();
    const supplier = document.getElementById("new-supplier").value.trim();
    const ingredients = document.getElementById("new-ingredients").value.trim();
    const nutrition = document.getElementById("new-nutrition").value.trim();

    const productData = {
      name,
      price,
      imageUrl,
      category,
      description,
      brand,
      comparePrice,
      originCountry,
      supplier,
      ingredients,
      nutrition,
    };

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
  loadOrders();
  await loadCategories();
  // renderCategoryList();
  setupCategoryListeners();
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

// Orderlistan som kommit in via API
async function loadOrders() {
  const container = document.getElementById("order-list");
  container.innerHTML = "<p>Laddar beställningar...</p>";

  try {
    const res = await fetch(
      "https://webshop-2025-be-g10-five.vercel.app/api/orders",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );

    if (!res.ok) throw new Error("Kunde inte hämta beställningar");

    const orders = await res.json();
    allOrders = orders;
    renderOrderList(allOrders);
  } catch (err) {
    console.error("Fel vid hämtning av orders:", err);
    container.innerHTML = "<p>Kunde inte ladda beställningar.</p>";
  }
}

// Renderar orderlistan
function renderOrderList(orders) {
  const container = document.getElementById("order-list");
  container.innerHTML = "";

  if (!orders.length) {
    container.innerHTML = "<p>Inga beställningar ännu.</p>";
    return;
  }

  orders
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((order) => {
      const el = document.createElement("div");
      el.className = "order-card";

      el.innerHTML = `
      <div class="order-summary">
        <p><strong>Beställnings-ID:</strong> ${order._id}</p>
        <p><strong>Kund:</strong> ${order.name}</p>
        <button class="toggle-details">Visa detaljer</button>
      </div>

      <div class="order-details hidden">
        <p><strong>Telefon:</strong> ${order.phone || "Saknas"}</p>
        <p><strong>Adress:</strong> ${order.address}</p>

        <h4>Produkter:</h4>
        <ul>
          ${order.items
            .map((item) => {
              if (!item.product) {
                return `
                 <li>
  Produkt borttagen – Info saknas – ${item.quantity} st
</li>

                `;
              }

              return `
                <li>
                  ${item.product.name} – 
                  ${formatPrice(item.product.price)} /st– 
                  ${item.quantity} st – 
                  ${formatPrice(item.product.price * item.quantity)}
                </li>
              `;
            })
            .join("")}
        </ul>

        <p><strong>Totalpris:</strong> ${formatPrice(order.total)}</p>


        <p><strong>Status:</strong> <span class="order-status ${order.status.replace(" ", "-")}" data-id="${order._id}">${order.status}</span></p>

        <select data-id="${order._id}" class="order-status-select hidden">
          <option value="mottagen" ${order.status === "mottagen" ? "selected" : ""}>Mottagen</option>
          <option value="under behandling" ${order.status === "under behandling" ? "selected" : ""}>Under behandling</option>
          <option value="skickad" ${order.status === "skickad" ? "selected" : ""}>Skickad</option>
          <option value="levererad" ${order.status === "levererad" ? "selected" : ""}>Levererad</option>
        </select>

        <button class="change-status-btn">Ändra status</button>
        <button class="print-order">Skriv ut plocklista</button>
      </div>
    `;

      container.appendChild(el);
    });

  // Toggle visa/dölj detaljer
  container.querySelectorAll(".toggle-details").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.nextElementSibling.classList.toggle("hidden");
    });
  });

  // Visa/dölj select när man klickar på "Ändra status"
  container.querySelectorAll(".change-status-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const select = btn.previousElementSibling;
      select.classList.toggle("hidden");
    });
  });

  // Ändra status
  container.querySelectorAll(".order-status-select").forEach((select) => {
    select.addEventListener("change", async () => {
      const orderId = select.dataset.id;
      const newStatus = select.value;

      try {
        const res = await fetch(
          `https://webshop-2025-be-g10-five.vercel.app/api/orders/admin/${orderId}/status`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ status: newStatus }),
          },
        );

        if (!res.ok) throw new Error("Kunde inte uppdatera status");

        alert("Status uppdaterad!");

        const statusSpan = container.querySelector(
          `.order-status[data-id="${orderId}"]`,
        );

        statusSpan.textContent = newStatus;
        statusSpan.className = `order-status ${newStatus.replace(" ", "-")}`;
      } catch (error) {
        console.error("Fel vid statusuppdatering:", error);
        alert("Det gick inte att uppdatera status.");
      }
    });
  });

  // Skriv ut plocklista
  container.querySelectorAll(".print-order").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderCard = btn.closest(".order-card");
      const printContent = orderCard.innerHTML;
      const originalContent = document.body.innerHTML;

      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      location.reload();
    });
  });
}

function createAdminProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // Visa pris med komma
  const price = formatPrice(product.price);

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
    <p>${price}</p>
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

      const product = allProducts.find((p) => p._id === id);
      document.getElementById("new-description").value =
        product.description || "";
      document.getElementById("new-brand").value = product.brand || "";
      document.getElementById("new-comparisonPrice").value =
        product.comparePrice || "";

      document.getElementById("new-originCountry").value =
        product.originCountry || "";
      document.getElementById("new-supplier").value = product.supplier || "";
      document.getElementById("new-ingredients").value =
        product.ingredients || "";
      document.getElementById("new-nutrition").value = product.nutrition || "";

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

        const data = await response.json();

        if (!response.ok) {
          // Visa backendens felmeddelande om produkten finns i order
          alert(data.error || "Produkten kunde inte raderas.");
          return;
        }

        await loadAdminProducts();
      } catch (err) {
        console.error("Fel vid radering:", err);
        alert("Något gick fel vid radering.");
      }
    });
  });
}

function setupCategoryListeners() {
  const form = document.getElementById("add-category-form");
  const list = document.getElementById("admin-category-list");

  if (!form || !list) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("new-category-name");
    const name = input.value.trim();

    if (!name) return;

    try {
      const res = await fetch(`${getBaseUrl()}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Kunde inte lägga till kategori");

      input.value = "";
      await loadCategories();
      renderCategoryList();
    } catch (err) {
      console.error("Fel vid skapandet av kategori", err);
      alert("Kategorin kunde inte skapas.");
    }
  });

  renderCategoryList();
}

function renderCategoryList() {
  const list = document.getElementById("admin-category-list");
  list.innerHTML = "";

  if (!window._categories || !Array.isArray(window._categories)) return;

  let currentlyEditing = null;

  window._categories.forEach((cat) => {
    const li = document.createElement("li");

    const input = document.createElement("input");
    input.type = "text";
    input.value = cat.name;
    input.disabled = true;

    const editBtn = document.createElement("button");
    editBtn.textContent = "Redigera";
    editBtn.classList.add("edit");

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Ta bort";
    deleteBtn.classList.add("delete");

    // REDIGERA/SPARA-knappen
    editBtn.addEventListener("click", async () => {
      if (currentlyEditing && currentlyEditing !== input) {
        currentlyEditing.disabled = true;
        currentlyEditing.nextSibling.textContent = "Redigera";
      }

      if (!input.disabled) {
        const newName = input.value.trim();
        if (!newName || newName === cat.name) {
          input.disabled = true;
          editBtn.textContent = "Redigera";
          currentlyEditing = null;
          return;
        }

        try {
          const res = await fetch(`${getBaseUrl()}/api/categories/${cat._id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ name: newName }),
          });

          if (!res.ok) throw new Error("Uppdatering misslyckades");

          await loadCategories();
          renderCategoryList();
        } catch (err) {
          console.error("Fel vid uppdatering:", err);
          alert("Kategorin kunde inte uppdateras.");
        }
      } else {
        input.disabled = false;
        input.focus();
        editBtn.textContent = "Spara";
        currentlyEditing = input;
      }
    });

    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Är du säker på att du vill ta bort kategorin?",
      );
      if (!confirmed) return;

      try {
        const res = await fetch(`${getBaseUrl()}/api/categories/${cat._id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          if (errorText.includes("products") || errorText.includes("kopplad")) {
            alert(" Du kan inte ta bort en kategori som innehåller produkter.");
          } else {
            throw new Error("Radering misslyckades");
          }
          return;
        }

        await loadCategories();
        renderCategoryList();
      } catch (err) {
        console.error("Fel vid radering:", err);
        alert("Kategorin kunde inte raderas.");
      }
    });

    li.appendChild(input);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}
