export const sortByPrice = (list: any[], asc = true) =>
  [...list].sort((a, b) =>
    asc ? a.basePrice - b.basePrice : b.basePrice - a.basePrice
  );