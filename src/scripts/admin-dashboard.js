import { fetchProducts, createProduct, fetchCategories } from "../utils/api.js";

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

  // Visa/dölj formulär för att lägga till produkt
  document.getElementById("add-product-btn")?.addEventListener("click", () => {
    document.getElementById("add-product-section").classList.toggle("hidden");
    formTitle("Lägg till ny produkt");
    cancelBtn.classList.add("hidden");
    form.removeAttribute("data-editing-id");
    form.reset();
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.removeAttribute("data-editing-id");
    document.getElementById("add-product-section").classList.add("hidden");
    formTitle("Lägg till ny produkt");
    cancelBtn.classList.add("hidden");
  });

  // Sökfunktionen
  document.getElementById("admin-search")?.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll(".product-card").forEach((card) => {
      const name = card.querySelector("h4").textContent.toLowerCase();
      card.style.display = name.includes(query) ? "block" : "none";
    });
  });

  loadAdminProducts();
  loadCategories();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("new-name").value.trim();
    let priceString = document
      .getElementById("new-price")
      .value.trim()
      .replace(",", ".");
    const price = parseFloat(priceString);
    const imageUrl = document.getElementById("new-image").value.trim();
    const category = document.getElementById("new-category").value;

    if (!name || isNaN(price) || !imageUrl || !category) {
      alert("Fyll i alla fält korrekt. T ex ett giltigt pris (ex 18,00).");
      return;
    }

    const productData = { name, price, imageUrl, category };
    const editingId = form.dataset.editingId;
    console.log(
      "Skickar till backend:",
      editingId ? "UPPDATERA" : "SKAPA",
      productData,
    );

    try {
      if (editingId) {
        // PUT - uppdatera
        const url = `https://webshop-2025-be-g10-five.vercel.app/api/products/${editingId}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(productData),
        });

        console.log("Svar från server (PUT):", res.status);

        if (!res.ok) {
          const errText = await res.text();
          console.error("PUT-fel:", errText);
          throw new Error("Uppdatering misslyckades.");
        }

        await loadAdminProducts();
      } else {
        // POST - skapa ny
        const createdProduct = await createProduct(productData);
        console.log("Skapad produkt:", createdProduct);

        const container = document.getElementById("admin-product-list");
        const card = createAdminProductCard(createdProduct);
        container.appendChild(card);
      }
      // Nollställ
      form.reset();
      form.removeAttribute("data-editing-id");
      formTitle("Lägg till ny produkt");
      cancelBtn.classList.add("hidden");
      document.getElementById("add-product-section").classList.add("hidden");
    } catch (error) {
      console.error("Fel vid sparande av produkt:", error);
      alert("Något gick fel när vi skulle spara. Kolla konsolen.");
    }
  });
});

async function loadAdminProducts() {
  const container = document.getElementById("admin-product-list");
  container.innerHTML = "<p>Laddar produkter...</p>";

  try {
    const products = await fetchProducts();
    if (!products.length) {
      container.innerHTML = "<p>Inga produkter hittades.</p>";
      return;
    }
    container.innerHTML = "";
    products.forEach((prod) => {
      container.appendChild(createAdminProductCard(prod));
    });
    addEditListeners();
    addDeleteListeners();
  } catch (error) {
    console.error("Kunde inte ladda produkter:", error);
    container.innerHTML = "<p>Kunde inte ladda produkter.</p>";
  }
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
  } catch (error) {
    console.error("Kunde inte ladda kategorier:", error);
  }
}

function createAdminProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  const priceStr = product.price.toFixed(2).replace(".", ",");

  let catName = "Ingen kategori";

  if (typeof product.category === "object" && product.category.name) {
    catName = product.category.name;
  } else if (typeof product.category === "string") {
    const foundCat = (window._categories || []).find(
      (cat) => cat._id === product.category,
    );
    if (foundCat) {
      catName = foundCat.name;
    } else {
      catName = product.category;
    }
  }

  card.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.name}">
    <h4>${product.name}</h4>
    <p>${priceStr} kr</p>
    <p><strong>${catName}</strong></p>
    <div class="actions">
      <button class="edit" data-id="${product._id}">Redigera</button>
      <button class="delete" data-id="${product._id}">Ta bort</button>
    </div>
  `;
  return card;
}

// Edit-knappar
function addEditListeners() {
  const editButtons = document.querySelectorAll(".edit");
  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".product-card");
      const productId = btn.dataset.id;

      const name = card.querySelector("h4").textContent;
      const priceText = card.querySelector("p").textContent.replace(" kr", "");
      const price = parseFloat(priceText.replace(",", "."));

      const image = card.querySelector("img").src;
      const categoryName = card.querySelector("strong").textContent;
      const categoryId = getCategoryIdByName(categoryName);

      document.getElementById("add-product-section").classList.remove("hidden");
      formTitle("Redigera produkt");
      document
        .getElementById("add-product-section")
        .scrollIntoView({ behavior: "smooth" });
      document.getElementById("new-name").value = name;
      document.getElementById("new-price").value = price;
      document.getElementById("new-image").value = image;
      document.getElementById("new-category").value = categoryId;

      const form = document.getElementById("add-product-form");
      form.dataset.editingId = productId;

      const cancelBtn = document.getElementById("cancel-edit-btn");
      cancelBtn.classList.remove("hidden");
    });
  });
}

function getCategoryIdByName(name) {
  if (!window._categories) return "";
  const found = window._categories.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase(),
  );
  return found?._id || "";
}

function formTitle(text) {
  document.querySelector("#add-product-section h3").textContent = text;
}

function addDeleteListeners() {
  const buttons = document.querySelectorAll(".delete");

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const productId = btn.dataset.id;
      const confirmDelete = confirm(
        "Är du säker på att du vill radera denna produkt?",
      );
      if (!confirmDelete) return;

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

        if (!response.ok) throw new Error("Misslyckades att radera produkt");

        await loadAdminProducts();
      } catch (err) {
        console.error("Fel vid radering:", err);
        alert("Produkten kunde inte raderas.");
      }
    });
  });
}
