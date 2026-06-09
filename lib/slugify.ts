export function generateSlug(setNum: string, name: string): string {
  const namePart = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
  return `${setNum}-${namePart}`;
}
