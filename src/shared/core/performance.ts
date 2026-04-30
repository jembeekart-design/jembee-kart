export const measure = (name: string, fn: Function) => {
  const t0 = performance.now();
  const res = fn();
  const t1 = performance.now();
  console.log(`${name}: ${t1 - t0}ms`);
  return res;
};