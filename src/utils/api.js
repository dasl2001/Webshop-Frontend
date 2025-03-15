
export function getBaseUrl() {
  // Get the group number from the hostname to determine the base URL for BE
  const regex = https://webshop-2025-be-g1.vercel.app/;
  const href = window.location.href;
  const match = regex.exec(href);
  console.log(match);
  if (match) {
    const group = match[1];
    return `https://webshop-2025-be-g1.vercel.app/`;
  }
  return "http://localhost:3000/";
}

export async function fetchProducts(endpoint = "api/products") {
  //! DONT USE THIS IN PRODUCTION
  const url = `${getBaseUrl()}${endpoint}`;
  const response = await fetch(url);
  if(response.ok){
    const data = await response.json();
    return data;
  }
  return [];    
}
