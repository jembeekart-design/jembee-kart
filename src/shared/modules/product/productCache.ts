let cache: any[] = [];

export const setCache = (d: any[]) => (cache = d);
export const getCache = () => cache;