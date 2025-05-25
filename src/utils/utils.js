export function formatPrice(price) {
  if (price || price === 0) {
    return price.toFixed(2).replace(".", ",") + " kr";
  }
  return ""; 
}
