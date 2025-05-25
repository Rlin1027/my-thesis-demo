import React, { useState } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, TableOfContents } from "docx";

const defaultUniversity = "國立中央大學";

function emptyChapter() {
  return { title: "", sections: [emptySection()] };
}
function emptySection() {
  return { title: "", subsections: [emptySubsection()] };
}
function emptySubsection() {
  return { title: "", content: "" };
}

// 判斷是否為簡單 Markdown 表格
function isMarkdownTable(text) {
  return text.trim().split("\n")[0].trim().startsWith("|") && text.includes("|---");
}
// 將簡單 Markdown 表格轉為 docx.js Table
function parseMarkdownTable(md) {
  const lines = md.trim().split("\n").filter(Boolean);
  if (lines.length < 2) return null;
  const rows = lines.filter(l => l.trim().startsWith("|"));
  const data = rows.map(r => r.split("|").slice(1, -1).map(cell => cell.trim()));
  // 去掉 header 分隔線
  const tableRows = data.filter(row => !row.every(cell => cell.match(/^[-:]+$/)));
  return new Table({
    rows: tableRows.map(row => new TableRow({
      children: row.map(cell => new TableCell({
        children: [new Paragraph(cell)]
      }))
    }))
  });
}

export default function ThesisForm() {
  const [form, setForm] = useState({
    title: "",
    author: "",
    advisor: "",
    university: defaultUniversity,
    year: "",
    department: "",
    abstract: "",
    keywords: "",
    chapters: [emptyChapter()],
    bibliography: ""
  });

  // 章節管理
  const addChapter = () => {
    setForm(f => ({ ...f, chapters: [...f.chapters, emptyChapter()] }));
  };
  const removeChapter = idx => {
    setForm(f => ({ ...f, chapters: f.chapters.filter((_, i) => i !== idx) }));
  };
  const setChapterField = (idx, key, value) => {
    const chapters = [...form.chapters];
    chapters[idx][key] = value;
    setForm(f => ({ ...f, chapters }));
  };
  // 節管理
  const addSection = cidx => {
    const chapters = [...form.chapters];
    chapters[cidx].sections.push(emptySection());
    setForm(f => ({ ...f, chapters }));
  };
  const removeSection = (cidx, sidx) => {
    const chapters = [...form.chapters];
    chapters[cidx].sections = chapters[cidx].sections.filter((_, i) => i !== sidx);
    setForm(f => ({ ...f, chapters }));
  };
  const setSectionField = (cidx, sidx, key, value) => {
    const chapters = [...form.chapters];
    chapters[cidx].sections[sidx][key] = value;
    setForm(f => ({ ...f, chapters }));
  };
  // 小節管理
  const addSubsection = (cidx, sidx) => {
    const chapters = [...form.chapters];
    chapters[cidx].sections[sidx].subsections.push(emptySubsection());
    setForm(f => ({ ...f, chapters }));
  };
  const removeSubsection = (cidx, sidx, subidx) => {
    const chapters = [...form.chapters];
    chapters[cidx].sections[sidx].subsections = chapters[cidx].sections[sidx].subsections.filter((_, i) => i !== subidx);
    setForm(f => ({ ...f, chapters }));
  };
  const setSubsectionField = (cidx, sidx, subidx, key, value) => {
    const chapters = [...form.chapters];
    chapters[cidx].sections[sidx].subsections[subidx][key] = value;
    setForm(f => ({ ...f, chapters }));
  };

  // 產生 LaTeX
  function renderLatex(form) {
    // preamble (簡化版，可自行擴充)
    let latex = `
\\documentclass[12pt]{report}
\\usepackage{CJKutf8}
\\begin{document}
\\begin{CJK}{UTF8}{bsmi}

\\title{${form.title}}
\\author{${form.author}}
\\date{${form.year}}
\\maketitle

\\begin{center}
${form.university} ${form.department}\\\\
指導教授：${form.advisor}\\\\
\\end{center}

\\begin{abstract}
${form.abstract}
\\end{abstract}

\\textbf{關鍵字：}${form.keywords}

\\tableofcontents
`;
    // chapters
    form.chapters.forEach((ch, cidx) => {
      if (ch.title) latex += `\n\\chapter{${ch.title}}\n`;
      ch.sections.forEach((sec, sidx) => {
        if (sec.title) latex += `\\section{${sec.title}}\n`;
        sec.subsections.forEach((sub, subidx) => {
          if (sub.title) latex += `\\subsection{${sub.title}}\n`;
          if (sub.content) latex += sub.content + "\n";
        });
      });
    });
    // bibliography
    latex += `\n\\chapter*{參考文獻}\n`;
    form.bibliography.split("\n").forEach(line => {
      if (line.trim()) latex += `\\noindent ${line}\\\\\n`;
    });
    latex += `\\end{CJK}\n\\end{document}`;
    return latex;
  }

  // 產生 docx（標題、目錄、表格、結構）
  async function generateDocx(form) {
    const docChildren = [];
    // 封面
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({ text: form.title, bold: true, size: 56 }),
        ],
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 },
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun({ text: form.author, size: 32 })],
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun({ text: form.university + " " + form.department, size: 32 })],
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun({ text: `指導教授：${form.advisor}`, size: 32 })],
        alignment: "center",
      }),
      new Paragraph({
        children: [new TextRun({ text: `學年度：${form.year}`, size: 32 })],
        alignment: "center",
      }),
      new Paragraph({ text: "", spacing: { after: 200 } })
    );
    // 摘要 & 關鍵字
    docChildren.push(
      new Paragraph({ text: "摘要", heading: HeadingLevel.HEADING_1 }),
      new Paragraph(form.abstract || ""),
      new Paragraph({ text: "關鍵字：" + form.keywords, spacing: { after: 200 } })
    );
    // 目錄
    docChildren.push(new Paragraph({ text: "目錄", heading: HeadingLevel.HEADING_1 }));
    docChildren.push(
      new TableOfContents("內容目錄", {
        hyperlink: true,
        headingStyleRange: "1-3"
      })
    );
    // 章節
    form.chapters.forEach((ch, cidx) => {
      if (ch.title) docChildren.push(new Paragraph({ text: ch.title, heading: HeadingLevel.HEADING_1 }));
      ch.sections.forEach((sec, sidx) => {
        if (sec.title) docChildren.push(new Paragraph({ text: sec.title, heading: HeadingLevel.HEADING_2 }));
        sec.subsections.forEach((sub, subidx) => {
          if (sub.title) docChildren.push(new Paragraph({ text: sub.title, heading: HeadingLevel.HEADING_3 }));
          if (sub.content) {
            // 若偵測到是 Markdown 表格
            if (isMarkdownTable(sub.content)) {
              const tbl = parseMarkdownTable(sub.content);
              if (tbl) docChildren.push(tbl);
            } else {
              // 一般文字
              docChildren.push(...sub.content.split("\n").map(txt => new Paragraph(txt)));
            }
          }
        });
      });
    });
    // 參考文獻
    docChildren.push(new Paragraph({ text: "參考文獻", heading: HeadingLevel.HEADING_1 }));
    docChildren.push(
      ...form.bibliography.split("\n").filter(Boolean).map(line => new Paragraph(line))
    );
    // 產生
    const doc = new Document({
      sections: [{ children: docChildren }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "thesis.docx";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">純文字轉 NCU 論文格式（LaTeX / docx）</h1>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>論文標題</label>
              <Input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} />
            </div>
            <div>
              <label>作者</label>
              <Input value={form.author} onChange={e=>setForm(f=>({...f,author:e.target.value}))} />
            </div>
            <div>
              <label>指導教授</label>
              <Input value={form.advisor} onChange={e=>setForm(f=>({...f,advisor:e.target.value}))} />
            </div>
            <div>
              <label>學校</label>
              <Input value={form.university} onChange={e=>setForm(f=>({...f,university:e.target.value}))} />
            </div>
            <div>
              <label>學年度</label>
              <Input value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} />
            </div>
            <div>
              <label>學位／科系</label>
              <Input value={form.department} onChange={e=>setForm(f=>({...f,department:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label>摘要</label>
              <Textarea rows={3} value={form.abstract} onChange={e=>setForm(f=>({...f,abstract:e.target.value}))} />
            </div>
            <div className="md:col-span-2">
              <label>關鍵字（用逗號分隔）</label>
              <Input value={form.keywords} onChange={e=>setForm(f=>({...f,keywords:e.target.value}))} />
            </div>
          </div>
          <div>
            <h2 className="text-xl mt-2 mb-1 font-bold">章節內容</h2>
            {form.chapters.map((ch, cidx) => (
              <div key={cidx} className="border rounded-xl p-3 mb-3 bg-slate-50">
                <div className="flex items-center gap-2 mb-2">
                  <Input placeholder={`第${cidx+1}章 標題`} value={ch.title} onChange={e=>setChapterField(cidx,"title",e.target.value)} />
                  <Button variant="destructive" size="sm" onClick={()=>removeChapter(cidx)} disabled={form.chapters.length===1}>刪除章</Button>
                </div>
                {ch.sections.map((sec, sidx) => (
                  <div key={sidx} className="pl-4 mb-2 border-l-2 border-gray-300">
                    <div className="flex items-center gap-2 mb-1">
                      <Input placeholder={`第${cidx+1}.${sidx+1}節 標題`} value={sec.title} onChange={e=>setSectionField(cidx,sidx,"title",e.target.value)} />
                      <Button variant="outline" size="sm" onClick={()=>removeSection(cidx,sidx)} disabled={ch.sections.length===1}>刪除節</Button>
                      <Button variant="outline" size="sm" onClick={()=>addSubsection(cidx,sidx)}>新增小節</Button>
                    </div>
                    {sec.subsections.map((sub, subidx) => (
                      <div key={subidx} className="pl-4 mb-2 border-l border-gray-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Input placeholder={`第${cidx+1}.${sidx+1}.${subidx+1}小節 標題`} value={sub.title} onChange={e=>setSubsectionField(cidx,sidx,subidx,"title",e.target.value)} />
                          <Button variant="outline" size="sm" onClick={()=>removeSubsection(cidx,sidx,subidx)} disabled={sec.subsections.length===1}>刪除小節</Button>
                        </div>
                        <Textarea rows={2} placeholder="小節內容 (可用Markdown表格格式)" value={sub.content} onChange={e=>setSubsectionField(cidx,sidx,subidx,"content",e.target.value)} />
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={()=>addSection(cidx)} className="mt-2">新增節</Button>
                  </div>
                ))}
              </div>
            ))}
            <Button variant="default" onClick={addChapter} className="mt-2">新增章節</Button>
          </div>
          <div>
            <h2 className="text-xl mt-2 mb-1 font-bold">參考文獻</h2>
            <Textarea rows={3} value={form.bibliography} onChange={e=>setForm(f=>({...f,bibliography:e.target.value}))} placeholder="每行一條文獻" />
          </div>
        </CardContent>
      </Card>
      <div className="bg-gray-900 rounded-xl text-white mt-4 p-4">
        <h2 className="text-lg font-bold mb-2">LaTeX 預覽</h2>
        <pre className="overflow-auto whitespace-pre-wrap text-xs">{renderLatex(form)}</pre>
      </div>
      <div className="flex gap-3 justify-end">
        <Button
          onClick={() => {
            const blob = new Blob([renderLatex(form)], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "thesis.tex";
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
          }}
        >下載 .tex</Button>
        <Button
          onClick={() => generateDocx(form)}
        >下載 .docx</Button>
      </div>
    </div>
  );
}
