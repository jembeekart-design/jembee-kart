export function generateBranchName(
  scannerId: string
) {
  const timestamp = Date.now();

  return `governance/${scannerId}-${timestamp}`;
}
