export const generateVariants = (sizes: string[], colors: string[]) => {
  return sizes.flatMap((s) =>
    colors.map((c) => ({
      id: `${s}-${c}`,
      size: s,
      color: c,
      stock: 10,
    }))
  );
};