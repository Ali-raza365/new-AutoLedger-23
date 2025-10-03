
// 🔹 Helper functions for parsing
export function parseNumber(value: any): number | null {
  if (!value || value === "") return null;
  const num = parseFloat(String(value).replace(/[$,]/g, ""));
  return isNaN(num) ? null : num;
}

export function parseInteger(value: any): number | null {
  if (!value || value === "") return null;
  const num = parseInt(String(value).replace(/[$,]/g, ""), 10);
  return isNaN(num) ? null : num;
}

export function parseDate(value: any): Date | null {
  if (!value || value === "") return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}