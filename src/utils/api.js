export function getBaseUrl() {
  if (window.location.href.includes("localhost")) {
    return "http://localhost:3000";
  }
  return "https://webshop-2025-be-g10-five.vercel.app";
}

export async function fetchProducts(endpoint = "/api/products") {
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return [];
}

export async function fetchCategories(endpoint = "/api/categories") {
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return [];
}

export async function loginAdmin(email, password) {
  const response = await fetch(`${getBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      identifier: email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error("Felaktiga inloggningsuppgifter");
  }

  const data = await response.json();
  return data;
}
