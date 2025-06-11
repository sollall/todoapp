import './styles.css'

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import React from "react";

export default function App() {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // リストは自動で無効にし、task-list専用にする
        bulletList: false,
        orderedList: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: `
        <ul data-type="taskList">
          <li data-type="taskItem" data-checked="true">A list item</li>
          <li data-type="taskItem" data-checked="false">And another one</li>
        </ul>
    `,
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 Notion風 ToDoエディタ</h1>
      <div className="border border-gray-300 rounded-md p-4">
        <EditorContent
          editor={editor}
          className="prose w-full h-full outline-none checked-task"
        />
      </div>
    </div>
  );
}
