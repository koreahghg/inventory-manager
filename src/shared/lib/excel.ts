import ExcelJS from "exceljs";

function sanitizeCell(value: unknown): unknown {
  // Neutralize spreadsheet formula injection (OWASP CSV/Excel Injection) for
  // user-supplied text fields (memo, counterparty, etc.) that Excel would
  // otherwise interpret as a formula on open.
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export async function toXlsx(sheetName: string, rows: unknown[][]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  rows.forEach((row) => worksheet.addRow(row.map(sanitizeCell)));
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
