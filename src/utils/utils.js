//För funktioner etc som kan behövas på flera .js-filer // utils.js
export function formatPrice(price) {
  if (price || price === 0) {
    return price.toFixed(2).replace(".", ",") + " kr";
  }
  return ""; 
}
