export const searchProducts = (list: any[], q: string) => {
  return list.filter((p) =>
    p.title.toLowerCase().includes(q.toLowerCase())
  );
};