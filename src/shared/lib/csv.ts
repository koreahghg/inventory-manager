function escapeCsvField(value: unknown): string {
  let str = value === null || value === undefined ? "" : String(value);
  // Neutralize spreadsheet formula injection (OWASP CSV Injection) for
  // user-supplied text fields (memo, platform, cancel_reason, etc.) that
  // Excel/LibreOffice would otherwise interpret as a formula on open.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** UTF-8 BOM prefix so Excel on Windows renders Korean text correctly. */
export function toCsv(rows: unknown[][]): string {
  const body = rows.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
  return `﻿${body}`;
}
