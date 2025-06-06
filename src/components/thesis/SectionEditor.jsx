import React from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import SubsectionEditor from "./SubsectionEditor";

export default function SectionEditor({
  section,
  chapterIndex,
  index,
  onChangeTitle,
  onAddSubsection,
  onRemove,
  onUpdateSubsection,
  onRemoveSubsection,
}) {
  return (
    <div className="pl-4 mb-2 border-l-2 border-gray-300">
      <div className="flex items-center gap-2 mb-1">
        <Input
          placeholder={`第${chapterIndex + 1}.${index + 1}節 標題`}
          value={section.title}
          onChange={e => onChangeTitle(e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={onRemove} disabled={false}>
          刪除節
        </Button>
        <Button variant="outline" size="sm" onClick={onAddSubsection}>
          新增小節
        </Button>
      </div>
      {section.subsections.map((sub, subidx) => (
        <SubsectionEditor
          key={sub.id}
          subsection={sub}
          index={subidx}
          onChangeTitle={val => onUpdateSubsection(sub.id, "title", val)}
          onChangeContent={val => onUpdateSubsection(sub.id, "content", val)}
          onRemove={() => onRemoveSubsection(sub.id)}
          disableRemove={section.subsections.length === 1}
        />
      ))}
    </div>
  );
}
