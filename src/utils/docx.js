import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, TableOfContents } from "docx";

export function isMarkdownTable(text) {
  return text.trim().split("\n")[0].trim().startsWith("|") && text.includes("|---");
}

export function parseMarkdownTable(md) {
  const lines = md.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return null;
  const rows = lines.filter(l => l.trim().startsWith("|"));
  const data = rows.map(r => r.split("|").slice(1, -1).map(cell => cell.trim()));
  const tableRows = data.filter(row => !row.every(cell => cell.match(/^[-:]+$/)));
  return new Table({
    rows: tableRows.map(row => new TableRow({
      children: row.map(cell => new TableCell({ children: [new Paragraph(cell)] }))
    }))
  });
}

export async function generateDocx(form) {
  const docChildren = [];
  docChildren.push(
    new Paragraph({
      children: [new TextRun({ text: form.title, bold: true, size: 56 })],
      heading: HeadingLevel.TITLE,
      spacing: { after: 400 },
      alignment: "center",
    }),
    new Paragraph({ children: [new TextRun({ text: form.author, size: 32 })], alignment: "center" }),
    new Paragraph({ children: [new TextRun({ text: form.university + " " + form.department, size: 32 })], alignment: "center" }),
    new Paragraph({ children: [new TextRun({ text: `指導教授：${form.advisor}`, size: 32 })], alignment: "center" }),
    new Paragraph({ children: [new TextRun({ text: `學年度：${form.year}`, size: 32 })], alignment: "center" }),
    new Paragraph({ text: "", spacing: { after: 200 } })
  );
  docChildren.push(
    new Paragraph({ text: "摘要", heading: HeadingLevel.HEADING_1 }),
    new Paragraph(form.abstract || ""),
    new Paragraph({ text: "關鍵字：" + form.keywords, spacing: { after: 200 } })
  );
  docChildren.push(new Paragraph({ text: "目錄", heading: HeadingLevel.HEADING_1 }));
  docChildren.push(new TableOfContents("內容目錄", { hyperlink: true, headingStyleRange: "1-3" }));
  form.chapters.forEach(ch => {
    if (ch.title) docChildren.push(new Paragraph({ text: ch.title, heading: HeadingLevel.HEADING_1 }));
    ch.sections.forEach(sec => {
      if (sec.title) docChildren.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_2 }));
      sec.subsections.forEach(sub => {
        if (sub.title) docChildren.push(new Paragraph({ text: sub.title, heading: HeadingLevel.HEADING_3 }));
        if (sub.content) {
          if (isMarkdownTable(sub.content)) {
            const tbl = parseMarkdownTable(sub.content);
            if (tbl) docChildren.push(tbl);
          } else {
            docChildren.push(...sub.content.split("\n").map(txt => new Paragraph(txt)));
          }
        }
      });
    });
  });
  docChildren.push(new Paragraph({ text: "參考文獻", heading: HeadingLevel.HEADING_1 }));
  docChildren.push(...form.bibliography.split("\n").filter(Boolean).map(line => new Paragraph(line)));
  const doc = new Document({ sections: [{ children: docChildren }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "thesis.docx";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
