export function generateMarketingCode(uid: string) {
  const firstPart = uid.slice(0, 6).toUpperCase();
  const lastPart = uid.slice(-4).toUpperCase();

  return `JBK${firstPart}${lastPart}`;
}

export function buildParentChain(
  sponsorUid: string,
  sponsorParentChain: string[]
) {
  if (!sponsorUid) return [];

  return [sponsorUid, ...sponsorParentChain].slice(0, 10);
}
