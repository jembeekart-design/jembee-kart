export const searchProducts = (list: any[], q: string) =>
  list.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));