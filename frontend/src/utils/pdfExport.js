// PDF exports with the KPT Society letterhead on every page.
// Takes the same "sheets" as downloadExcel(), so every Excel export has a PDF twin.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// ---- Letterhead (update logos / contact details here) ----
export const LETTERHEAD = {
  name: "KPT Society",
  address: "Kadri Hills, Mangaluru 575004",
  email: "kptsociety@gmail.com",
  phone: "+91-9741127644 / +91-9742023708",
  leftLogo:
    "https://res.cloudinary.com/dnreqxbdw/image/upload/v1757932916/logo3_vptob4.jpg",
  rightLogos: [
    "https://res.cloudinary.com/dnreqxbdw/image/upload/v1757932915/logo4_q0ujtn.png",
    "https://res.cloudinary.com/dnreqxbdw/image/upload/v1757932915/logo5_czeuoz.png",
  ],
};

const COLORS = {
  ink: [43, 37, 64],
  muted: [119, 113, 139],
  lavender: [205, 180, 219],
  lavenderSoft: [250, 246, 252],
  pink: [255, 175, 204],
  blue: [162, 210, 255],
};

const HEADER_H = 34; // mm reserved at the top of every page
const MARGIN = 12;

// The built-in PDF font has no ₹ glyph
const clean = (v) => {
  if (v === null || v === undefined) return "";
  if (typeof v === "number")
    return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  return String(v).replace(/₹\s?/g, "Rs. ");
};

// Loads an image URL as a data URL plus its size (null if it can't be loaded)
const imageCache = new Map();
function loadImage(url) {
  if (!url) return Promise.resolve(null);
  if (!imageCache.has(url)) {
    imageCache.set(
      url,
      fetch(url)
        .then((r) => (r.ok ? r.blob() : Promise.reject()))
        .then(
          (blob) =>
            new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            }),
        )
        .then(
          (dataUrl) =>
            new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                const w = img.naturalWidth;
                const h = img.naturalHeight;
                // Shrink big logos so the PDF stays small (≈ 300 px is plenty)
                const scale = Math.min(1, 300 / Math.max(w, h));
                if (scale < 1 && typeof document !== "undefined") {
                  const canvas = document.createElement("canvas");
                  canvas.width = Math.round(w * scale);
                  canvas.height = Math.round(h * scale);
                  canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
                  return resolve({
                    dataUrl: canvas.toDataURL("image/png"),
                    w: canvas.width,
                    h: canvas.height,
                  });
                }
                resolve({ dataUrl, w, h });
              };
              img.onerror = () => resolve(null);
              img.src = dataUrl;
            }),
        )
        .catch(() => null),
    );
  }
  return imageCache.get(url);
}

function addImage(doc, img, x, y, maxW, maxH) {
  if (!img) return 0;
  const ratio = Math.min(maxW / img.w, maxH / img.h);
  const w = img.w * ratio;
  const h = img.h * ratio;
  const fmt = img.dataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
  doc.addImage(img.dataUrl, fmt, x, y + (maxH - h) / 2, w, h);
  return w;
}

function drawLetterhead(doc, logos) {
  const pageW = doc.internal.pageSize.getWidth();
  const logoH = 20;
  const top = 7;

  addImage(doc, logos.left, MARGIN, top, 26, logoH);
  let x = pageW - MARGIN;
  [...logos.right].reverse().forEach((img) => {
    if (!img) return;
    const w = Math.min(26, (img.w / img.h) * logoH);
    x -= w;
    addImage(doc, img, x, top, w, logoH);
    x -= 3;
  });

  const cx = pageW / 2;
  doc.setTextColor(...COLORS.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(LETTERHEAD.name, cx, top + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...COLORS.muted);
  doc.text(LETTERHEAD.address, cx, top + 12, { align: "center" });
  doc.text(
    `Email: ${LETTERHEAD.email}   |   Phone: ${LETTERHEAD.phone}`,
    cx,
    top + 17,
    { align: "center" },
  );

  // Palette stripe under the letterhead
  const lineY = top + logoH + 3;
  const third = (pageW - MARGIN * 2) / 3;
  [COLORS.lavender, COLORS.pink, COLORS.blue].forEach((c, i) => {
    doc.setFillColor(...c);
    doc.rect(MARGIN + third * i, lineY, third, 1.2, "F");
  });
}

function drawFooter(doc, page, total) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Generated on ${new Date().toLocaleString("en-GB")}`,
    MARGIN,
    pageH - 6,
  );
  doc.text(`Page ${page} of ${total}`, pageW - MARGIN, pageH - 6, {
    align: "right",
  });
}

const tableStyles = {
  theme: "grid",
  margin: { top: HEADER_H + 4, left: MARGIN, right: MARGIN, bottom: 14 },
  styles: {
    font: "helvetica",
    fontSize: 8,
    cellPadding: 1.6,
    textColor: COLORS.ink,
    lineColor: [231, 228, 238],
    lineWidth: 0.1,
    overflow: "linebreak",
  },
  headStyles: {
    fillColor: COLORS.lavender,
    textColor: COLORS.ink,
    fontStyle: "bold",
  },
  footStyles: {
    fillColor: [243, 241, 247],
    textColor: COLORS.ink,
    fontStyle: "bold",
  },
  alternateRowStyles: { fillColor: COLORS.lavenderSoft },
};

// A sheet is either { rows: [{...}] } or a structured
// { details: [[label, value], ...], head: [...], body: [[...]], foot: [...] }
function sheetParts(sheet) {
  if (sheet.head) return sheet;
  if (sheet.rows?.length) {
    const head = Object.keys(sheet.rows[0]);
    return { head, body: sheet.rows.map((r) => head.map((k) => r[k])) };
  }
  return null;
}

export async function downloadPdf(fileName, sheets, { title } = {}) {
  const parts = sheets
    .filter(Boolean)
    .map((s) => ({ sheet: s, p: sheetParts(s) }))
    .filter((x) => x.p && (x.p.body?.length || x.p.details?.length));

  const widest = Math.max(0, ...parts.map((x) => x.p.head?.length || 0));
  const doc = new jsPDF({
    orientation: widest > 7 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const [left, ...right] = await Promise.all([
    loadImage(LETTERHEAD.leftLogo),
    ...LETTERHEAD.rightLogos.map(loadImage),
  ]);
  const logos = { left, right };

  let y = HEADER_H + 6;
  if (title) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(title), MARGIN, y);
    y += 6;
  }

  if (!parts.length) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("No records to export", MARGIN, y + 4);
  }

  parts.forEach(({ sheet, p }, i) => {
    if (i > 0) {
      doc.addPage();
      y = HEADER_H + 6;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...COLORS.ink);
    doc.text(clean(sheet.title || sheet.name), MARGIN, y);
    y += 3;

    if (p.details?.length) {
      // Two label/value pairs per line
      const rows = [];
      for (let k = 0; k < p.details.length; k += 2) {
        const a = p.details[k];
        const b = p.details[k + 1] || ["", ""];
        rows.push([a[0], clean(a[1]), b[0], clean(b[1])]);
      }
      autoTable(doc, {
        ...tableStyles,
        theme: "plain",
        startY: y,
        body: rows,
        styles: { ...tableStyles.styles, fontSize: 9, cellPadding: 1.2 },
        columnStyles: {
          0: { fontStyle: "bold", textColor: COLORS.muted },
          2: { fontStyle: "bold", textColor: COLORS.muted },
        },
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    if (p.body?.length) {
      autoTable(doc, {
        ...tableStyles,
        startY: y,
        head: [p.head.map(clean)],
        body: p.body.map((r) => r.map(clean)),
        foot: p.foot ? [p.foot.map(clean)] : undefined,
        showFoot: "lastPage",
      });
      y = doc.lastAutoTable.finalY + 6;
    }
  });

  const total = doc.getNumberOfPages();
  for (let page = 1; page <= total; page++) {
    doc.setPage(page);
    drawLetterhead(doc, logos);
    drawFooter(doc, page, total);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`${fileName.replace(/[^\w-]+/g, "_")}_${stamp}.pdf`);
}
