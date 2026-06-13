/**
 * Escape a string for safe interpolation into HTML (e.g. email bodies built
 * from template literals). Prevents user-supplied input such as names or
 * messages from injecting markup or links into notification emails.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
