/**
 * Utility functions for CSV export functionality
 */
import * as XLSX from "xlsx";


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

// export function parseCsv(csvContent: string): Record<string, string>[] {
//   if (!csvContent || csvContent.length === 0) {
//     return [];
//   }

//   let content = csvContent;
//   if (content.charCodeAt(0) === 0xFEFF) {
//     content = content.substring(1);
//   }

//   const lines: string[] = [];
//   let currentLine = '';
//   let insideQuotes = false;

//   for (let i = 0; i < content.length; i++) {
//     const char = content[i];
//     const nextChar = content[i + 1];

//     if (char === '"') {
//       if (insideQuotes && nextChar === '"') {
//         currentLine += '"';
//         i++;
//       } else {
//         insideQuotes = !insideQuotes;
//       }
//     } else if ((char === '\n' || char === '\r') && !insideQuotes) {
//       if (char === '\r' && nextChar === '\n') {
//         i++;
//       }
//       if (currentLine.length > 0) {
//         lines.push(currentLine);
//       }
//       currentLine = '';
//     } else {
//       currentLine += char;
//     }
//   }

//   if (currentLine.length > 0) {
//     lines.push(currentLine);
//   }

//   if (lines.length === 0) {
//     return [];
//   }

//   const headers = parseCSVLine(lines[0]);
//   const results: Record<string, string>[] = [];

//   for (let i = 1; i < lines.length; i++) {
//     const values = parseCSVLine(lines[i]);
//     const row: Record<string, string> = {};
    
//     headers.forEach((header, index) => {
//       row[header] = values[index] || '';
//     });
    
//     results.push(row);
//   }

//   return results;
// }

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Generate filename with current date
 */
export function generateExportFilename(prefix: string): string {
  const today = new Date().toISOString().split('T')[0];
  return `${prefix}_export_${today}.csv`;
}


/**
 * Parse CSV text into an array of records
 */
export function parseCsv(csvContent: string): Record<string, string>[] {
  if (!csvContent) return [];

  // Strip BOM if present
  if (csvContent.charCodeAt(0) === 0xFEFF) {
    csvContent = csvContent.substring(1);
  }

  const lines: string[] = [];
  let currentLine = "";
  let insideQuotes = false;

  for (let i = 0; i < csvContent.length; i++) {
    const char = csvContent[i];
    const nextChar = csvContent[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentLine += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") i++;
      if (currentLine.length > 0) lines.push(currentLine);
      currentLine = "";
    } else {
      currentLine += char;
    }
  }

  if (currentLine.length > 0) lines.push(currentLine);
  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    results.push(row);
  }

  return results;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse file (CSV or Excel) into array of objects
 */
export async function parseFile(file: File): Promise<Record<string, string>[]> {
  const isCsv = file.name.endsWith(".csv");
  const isExcel = file.name.endsWith(".xls") || file.name.endsWith(".xlsx");

  if (isCsv) {
    const text = await file.text();
    return parseCsv(text);
  }

  if (isExcel) {
    const data = new Uint8Array(await file.arrayBuffer());
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "" });
  }

  throw new Error("Unsupported file type");
}

/**
 * Export rows as Excel
 */
export function downloadXlsx(headers: string[], rows: (string | number | null | undefined)[][], filename: string): void {
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}
