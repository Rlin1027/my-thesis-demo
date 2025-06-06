import React from "react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

export default function SubsectionEditor({ subsection, index, onChangeTitle, onChangeContent, onRemove, disableRemove }) {
  return (
    <div className="pl-4 mb-2 border-l border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <Input
          placeholder={`小節${index + 1} 標題`}
          value={subsection.title}
          onChange={e => onChangeTitle(e.target.value)}
        />
        <Button variant="outline" size="sm" onClick={onRemove} disabled={disableRemove}>
          刪除小節
        </Button>
      </div>
      <Textarea
        rows={2}
        placeholder="小節內容 (可用Markdown表格格式)"
        value={subsection.content}
        onChange={e => onChangeContent(e.target.value)}
      />
    </div>
  );
}
