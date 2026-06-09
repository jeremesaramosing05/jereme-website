// Generates a minimal one-page placeholder PDF at public/resume.pdf.
// Replace that file with your real resume â€” then this script can be deleted.
import fs from "node:fs";

const content = [
  "BT /F1 24 Tf 72 720 Td (Jereme Saramosing) Tj ET",
  "BT /F1 12 Tf 72 690 Td (Placeholder resume - replace public/resume.pdf with your real resume.) Tj ET",
].join("\n");

const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objects.forEach((obj, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
});

const xref = pdf.length;
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
offsets.forEach((o) => {
  pdf += `${String(o).padStart(10, "0")} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

fs.writeFileSync("public/resume.pdf", pdf, "binary");
console.log(`public/resume.pdf written (${pdf.length} bytes)`);
