export function buildParentChain(
  sponsorUid: string,
  sponsorParentChain: string[]
) {
  if (!sponsorUid) return [];

  return [sponsorUid, ...sponsorParentChain].slice(0, 10);
}
