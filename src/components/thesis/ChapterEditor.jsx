import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import SectionEditor from "./SectionEditor";

export default function ChapterEditor({
  chapter,
  index,
  onChangeTitle,
  onAddSection,
  onRemove,
  onUpdateSection,
  onRemoveSection,
  onAddSubsection,
  onUpdateSubsection,
  onRemoveSubsection,
}) {
  return (
    <div className="border rounded-xl p-3 mb-3 bg-slate-50">
      <div className="flex items-center gap-2 mb-2">
        <Input
          placeholder={`第${index + 1}章 標題`}
          value={chapter.title}
          onChange={e => onChangeTitle(e.target.value)}
        />
        <Button variant="destructive" size="sm" onClick={onRemove} disabled={false}>
          刪除章
        </Button>
      </div>
      {chapter.sections.map((sec, sidx) => (
        <SectionEditor
          key={sec.id}
          section={sec}
          chapterIndex={index}
          index={sidx}
          onChangeTitle={val => onUpdateSection(sec.id, "title", val)}
          onAddSubsection={() => onAddSubsection(sec.id)}
          onRemove={() => onRemoveSection(sec.id)}
          onUpdateSubsection={(subId, field, val) =>
            onUpdateSubsection(sec.id, subId, field, val)
          }
          onRemoveSubsection={subId => onRemoveSubsection(sec.id, subId)}
        />
      ))}
      <Button variant="outline" size="sm" className="mt-2" onClick={onAddSection}>
        新增節
      </Button>
    </div>
  );
}
