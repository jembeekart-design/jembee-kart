export const parseCSV = (csv: string) =>
  csv.split("\n").map((r) => {
    const [title, price] = r.split(",");
    return { title, basePrice: Number(price) };
  });