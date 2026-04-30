export const mergeCart = (guest: any[], user: any[]) => {
  const merged = [...user];

  guest.forEach((g) => {
    const existing = merged.find((u) => u.id === g.id);
    if (existing) {
      existing.qty += g.qty;
    } else {
      merged.push(g);
    }
  });

  return merged;
};