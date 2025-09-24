/**
 * Utility functions for CSV export functionality
 */

/**
 * Safely escape a value for CSV format
 * - Handles quotes, commas, newlines
 * - Prevents CSV injection attacks
 * - Preserves zero values using nullish coalescing
 */
export function safeCsvValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const strValue = String(value);
  
  // Prevent CSV injection by prefixing dangerous characters with a space
  if (strValue.startsWith('=') || strValue.startsWith('+') || 
      strValue.startsWith('-') || strValue.startsWith('@')) {
    return `"${' ' + strValue.replace(/"/g, '""')}"`;
  }

  // Escape quotes and wrap in quotes if value contains commas, quotes, or newlines
  if (strValue.includes('"') || strValue.includes(',') || strValue.includes('\n') || strValue.includes('\r')) {
    return `"${strValue.replace(/"/g, '""')}"`;
  }

  return strValue;
}

/**
 * Format date consistently for CSV export (ISO format YYYY-MM-DD)
 */
export function formatCsvDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch {
    return '';
  }
}

/**
 * Build CSV content from headers and rows
 */
export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const csvHeaders = headers.map(header => safeCsvValue(header)).join(',');
  const csvRows = rows.map(row => 
    row.map(cell => safeCsvValue(cell)).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file with proper resource cleanup
 */
export function downloadCsv(csvContent: string, filename: string): void {
  // Add BOM for proper Excel UTF-8 handling
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the object URL
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with current date
 */
export function generateExportFilename(prefix: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${prefix}_export_${today}.csv`;
}