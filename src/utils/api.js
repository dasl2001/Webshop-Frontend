export function getBaseUrl() {
  if (window.location.href.includes("localhost")) {
    return "http://localhost:3000";
  }
  return "https://webshop-2025-be-g10-five.vercel.app";
}

export async function fetchProducts(endpoint = "/api/products") {
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function fetchCategories(endpoint = "/api/categories") {
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (response.ok) {
    return await response.json();
  }
  return [];
}

export async function loginAdmin(email, password) {
  const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: email, password }),
  });

  if (!response.ok) {
    throw new Error("Felaktiga inloggningsuppgifter");
  }
  return await response.json();
}

export async function createProduct(product) {
  const url = `${getBaseUrl()}/api/products`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(product),
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage);
  }
  return await response.json();
}
