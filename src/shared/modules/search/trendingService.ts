let trending: string[] = [];

export const updateTrending = (query: string) => {
  trending.unshift(query);

  // unique + limit
  trending = [...new Set(trending)].slice(0, 10);
};

export const getTrending = () => trending;