import { validateProduct } from "./productSchema";
import { generateVariants } from "./variantService";
import { calculateFinalPrice } from "./pricingEngine";
import { mapQikinkProduct } from "./qikinkMapper";
import { saveProduct, fetchProducts } from "./productRepository";
import { setCache, getCache } from "./productCache";
import { searchProducts } from "./productSearch";
import { filterByCategory } from "./productFilter";
import { sortByPrice } from "./productSort";
import { trackProductView } from "./productAnalytics";

let margin = 30;
let init = false;

export const initProducts = async () => {
  if (init) return;
  const p = await fetchProducts();
  setCache(p);
  init = true;
};

export const createProduct = async (d: any) => {
  validateProduct(d);

  const p = {
    id: Date.now().toString(),
    title: d.title,
    description: d.description || "",
    basePrice: d.basePrice,
    images: d.images || [],
    variants: generateVariants(d.sizes || [], d.colors || []),
    createdAt: Date.now(),
  };

  const saved = await saveProduct(p);
  setCache([saved, ...getCache()]);
  return saved;
};

export const importQikink = async (data: any[]) => {
  return Promise.all(
    data.map((d) =>
      createProduct({
        ...mapQikinkProduct(d),
        sizes: ["S", "M"],
        colors: ["Black"],
      })
    )
  );
};

export const getProducts = async () => {
  if (!getCache().length) await initProducts();
  return getCache();
};

export const getProduct = async (id: string) => {
  const p = (await getProducts()).find((x) => x.id === id);
  if (p) trackProductView(id);
  return p;
};

export const applyPricing = (p: any) => ({
  ...p,
  finalPrice: calculateFinalPrice(p.basePrice, margin),
});

export const search = async (q: string) =>
  searchProducts(await getProducts(), q);

export const filter = async (c: string) =>
  filterByCategory(await getProducts(), c);

export const sort = async (asc = true) =>
  sortByPrice(await getProducts(), asc);