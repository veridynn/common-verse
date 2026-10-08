// Keep seed identifiers in CMS records for repeatable imports, not in public names.
export function authorDisplayName(name: string): string {
  return name.replace(/\s+\[bulk-demo-v1-\d+\]$/, "");
}
