// Imported credits are plain text followed by source and license URLs.
// Validate links before rendering editorial data as clickable attribution.
export function mediaCredit(credit: string | null | undefined) {
  if (!credit) return null;
  const [text, source, license] = credit.split("\n");
  try {
    const sourceUrl = new URL(source);
    const licenseUrl = new URL(license);
    if (
      sourceUrl.protocol === "https:" &&
      sourceUrl.hostname === "commons.wikimedia.org" &&
      licenseUrl.protocol === "https:" &&
      licenseUrl.hostname === "creativecommons.org"
    )
      return { text, source: sourceUrl.href, license: licenseUrl.href };
  } catch {
    /* Ordinary editorial credit has no links. */
  }
  return { text: credit, source: null, license: null };
}
