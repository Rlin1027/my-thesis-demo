import React, { useReducer } from "react";
import { Button } from "./components/ui/button";
import { Card, CardContent } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import ChapterEditor from "./components/thesis/ChapterEditor";
import { generateDocx } from "./utils/docx";

const defaultUniversity = "國立中央大學";

let idCounter = 0;
const genId = () => ++idCounter;

const emptySubsection = () => ({ id: genId(), title: "", content: "" });
const emptySection = () => ({ id: genId(), title: "", subsections: [emptySubsection()] });
const emptyChapter = () => ({ id: genId(), title: "", sections: [emptySection()] });

const initialState = {
  title: "",
  author: "",
  advisor: "",
  university: defaultUniversity,
  year: "",
  department: "",
  abstract: "",
  keywords: "",
  chapters: [emptyChapter()],
  bibliography: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "setField":
      return { ...state, [action.field]: action.value };
    case "addChapter":
      return { ...state, chapters: [...state.chapters, emptyChapter()] };
    case "removeChapter":
      return { ...state, chapters: state.chapters.filter(ch => ch.id !== action.id) };
    case "setChapterField":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.id ? { ...ch, [action.field]: action.value } : ch
        ),
      };
    case "addSection":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? { ...ch, sections: [...ch.sections, emptySection()] }
            : ch
        ),
      };
    case "removeSection":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? { ...ch, sections: ch.sections.filter(sec => sec.id !== action.sectionId) }
            : ch
        ),
      };
    case "setSectionField":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? {
                ...ch,
                sections: ch.sections.map(sec =>
                  sec.id === action.sectionId ? { ...sec, [action.field]: action.value } : sec
                ),
              }
            : ch
        ),
      };
    case "addSubsection":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? {
                ...ch,
                sections: ch.sections.map(sec =>
                  sec.id === action.sectionId
                    ? { ...sec, subsections: [...sec.subsections, emptySubsection()] }
                    : sec
                ),
              }
            : ch
        ),
      };
    case "removeSubsection":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? {
                ...ch,
                sections: ch.sections.map(sec =>
                  sec.id === action.sectionId
                    ? {
                        ...sec,
                        subsections: sec.subsections.filter(
                          sub => sub.id !== action.subsectionId
                        ),
                      }
                    : sec
                ),
              }
            : ch
        ),
      };
    case "setSubsectionField":
      return {
        ...state,
        chapters: state.chapters.map(ch =>
          ch.id === action.chapterId
            ? {
                ...ch,
                sections: ch.sections.map(sec =>
                  sec.id === action.sectionId
                    ? {
                        ...sec,
                        subsections: sec.subsections.map(sub =>
                          sub.id === action.subsectionId
                            ? { ...sub, [action.field]: action.value }
                            : sub
                        ),
                      }
                    : sec
                ),
              }
            : ch
        ),
      };
    default:
      return state;
  }
}

export default function ThesisForm() {
  const [form, dispatch] = useReducer(reducer, initialState);

  function renderLatex(f) {
    // 以下所有 LaTeX 指令的「反斜線」都要用 \\ 逃脫
    let latex = `\\documentclass[12pt]{report}\n`;
    latex += "\\usepackage{CJKutf8}\n";
    latex += "\\begin{document}\n\\begin{CJK}{UTF8}{bsmi}\n";
    latex += `\\title{${f.title}}\n`;
    latex += `\\author{${f.author}}\n`;
    latex += `\\date{${f.year}}\n`;
    latex += "\\maketitle\n";
    latex += "\\begin{center}\n";
    latex += `${f.university} ${f.department}\\\\\n`;
    latex += `指導教授：${f.advisor}\\\\\n`;
    latex += "\\end{center}\n";
    latex += "\\begin{abstract}\n" + f.abstract + "\n\\end{abstract}\n";
    latex += "\\textbf{關鍵字：}" + f.keywords + "\n";
    latex += "\\tableofcontents\n";
    f.chapters.forEach(ch => {
      if (ch.title) latex += `\\chapter{${ch.title}}\n`;
      ch.sections.forEach(sec => {
        if (sec.title) latex += `\\section{${sec.title}}\n`;
        sec.subsections.forEach(sub => {
          if (sub.title) latex += `\\subsection{${sub.title}}\n`;
          if (sub.content) latex += sub.content + "\n";
        });
      });
    });
    latex += `\\chapter*{參考文獻}\n`;
    f.bibliography.split("\n").forEach(line => {
      if (line.trim()) latex += `\\noindent ${line}\\\\\n`;
    });
    latex += "\\end{CJK}\n\\end{document}";
    return latex;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">
        純文字轉 NCU 論文格式（LaTeX / docx）
      </h1>
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">論文標題</label>
              <Input
                value={form.title}
                onChange={e =>
                  dispatch({ type: "setField", field: "title", value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">作者</label>
              <Input
                value={form.author}
                onChange={e =>
                  dispatch({ type: "setField", field: "author", value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">指導教授</label>
              <Input
                value={form.advisor}
                onChange={e =>
                  dispatch({ type: "setField", field: "advisor", value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">學校</label>
              <Input
                value={form.university}
                onChange={e =>
                  dispatch({ type: "setField", field: "university", value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">學年度</label>
              <Input
                value={form.year}
                onChange={e =>
                  dispatch({ type: "setField", field: "year", value: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block mb-1">學位／科系</label>
              <Input
                value={form.department}
                onChange={e =>
                  dispatch({ type: "setField", field: "department", value: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">摘要</label>
              <Textarea
                rows={3}
                value={form.abstract}
                onChange={e =>
                  dispatch({ type: "setField", field: "abstract", value: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-1">
                關鍵字（用逗號分隔）
              </label>
              <Input
                value={form.keywords}
                onChange={e =>
                  dispatch({ type: "setField", field: "keywords", value: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <h2 className="text-xl mt-2 mb-1 font-bold">章節內容</h2>
            {form.chapters.map((ch, cidx) => (
              <ChapterEditor
                key={ch.id}
                chapter={ch}
                index={cidx}
                onChangeTitle={val =>
                  dispatch({ type: "setChapterField", id: ch.id, field: "title", value: val })
                }
                onAddSection={() =>
                  dispatch({ type: "addSection", chapterId: ch.id })
                }
                onRemove={() =>
                  dispatch({ type: "removeChapter", id: ch.id })
                }
                onUpdateSection={(secId, field, val) =>
                  dispatch({
                    type: "setSectionField",
                    chapterId: ch.id,
                    sectionId: secId,
                    field,
                    value: val,
                  })
                }
                onRemoveSection={secId =>
                  dispatch({ type: "removeSection", chapterId: ch.id, sectionId: secId })
                }
                onAddSubsection={secId =>
                  dispatch({
                    type: "addSubsection",
                    chapterId: ch.id,
                    sectionId: secId,
                  })
                }
                onUpdateSubsection={(secId, subId, field, val) =>
                  dispatch({
                    type: "setSubsectionField",
                    chapterId: ch.id,
                    sectionId: secId,
                    subsectionId: subId,
                    field,
                    value: val,
                  })
                }
                onRemoveSubsection={(secId, subId) =>
                  dispatch({
                    type: "removeSubsection",
                    chapterId: ch.id,
                    sectionId: secId,
                    subsectionId: subId,
                  })
                }
              />
            ))}
            <Button
              variant="default"
              onClick={() => dispatch({ type: "addChapter" })}
              className="mt-2"
            >
              新增章節
            </Button>
          </div>
          <div>
            <h2 className="text-xl mt-2 mb-1 font-bold">
              參考文獻
            </h2>
            <Textarea
              rows={3}
              value={form.bibliography}
              onChange={e =>
                dispatch({ type: "setField", field: "bibliography", value: e.target.value })
              }
              placeholder="每行一條文獻"
            />
          </div>
        </CardContent>
      </Card>
      <div className="bg-gray-900 rounded-xl text-white mt-4 p-4">
        <h2 className="text-lg font-bold mb-2">LaTeX 預覽</h2>
        <pre className="overflow-auto whitespace-pre-wrap text-xs">
          {renderLatex(form)}
        </pre>
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
        >
          下載 .tex
        </Button>
        <Button onClick={() => generateDocx(form)}>
          下載 .docx
        </Button>
      </div>
    </div>
  );
}
