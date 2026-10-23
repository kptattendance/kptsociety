import { downloadExcel } from "./excelExport";

// One entry point for both formats. The PDF library loads only when needed.
export async function exportFile(format, fileName, sheets, options) {
  if (format === "pdf") {
    const { downloadPdf } = await import("./pdfExport");
    return downloadPdf(fileName, sheets, options);
  }
  return downloadExcel(fileName, sheets);
}
