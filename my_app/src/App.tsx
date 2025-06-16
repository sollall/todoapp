import './styles.css'
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import React, { useState } from "react";

export default function App() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
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
          <li data-type="taskItem" data-checked="false">親タスク1
            <ul data-type="taskList">
              <li data-type="taskItem" data-checked="false">子タスク1-1</li>
              <li data-type="taskItem" data-checked="false">子タスク1-2</li>
            </ul>
          </li>
          <li data-type="taskItem" data-checked="false">親タスク2
            <ul data-type="taskList">
              <li data-type="taskItem" data-checked="true">子タスク2-1</li>
              <li data-type="taskItem" data-checked="false">子タスク2-2</li>
              <li data-type="taskItem" data-checked="false">子タスク2-3</li>
            </ul>
          </li>
          <li data-type="taskItem" data-checked="false">通常のタスク</li>
        </ul>
    `,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      // 親タスクの自動完了処理
      const parentTasks = doc.querySelectorAll('li[data-type="taskItem"]');
      let hasChanges = false;
      
      parentTasks.forEach(parentTask => {
        // 直下の子タスクリストを取得
        const childTaskList = parentTask.querySelector('ul[data-type="taskList"]');
        
        if (childTaskList) {
          // 直下の子タスクのみを取得（孫タスクは除外）
          const childTasks = childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]');
          
          if (childTasks.length > 0) {
            // すべての子タスクが完了しているかチェック
            const allChildrenCompleted = Array.from(childTasks).every(child => 
              child.getAttribute('data-checked') === 'true'
            );
            
            // 親タスクの現在の状態
            const parentChecked = parentTask.getAttribute('data-checked') === 'true';
            
            // 子タスクがすべて完了していて、親が未完了の場合
            if (allChildrenCompleted && !parentChecked) {
              parentTask.setAttribute('data-checked', 'true');
              hasChanges = true;
            }
            // 子タスクに未完了があって、親が完了している場合
            else if (!allChildrenCompleted && parentChecked) {
              parentTask.setAttribute('data-checked', 'false');
              hasChanges = true;
            }
          }
        }
      });
      
      // 変更があった場合、エディタの内容を更新
      if (hasChanges) {
        const updatedHtml = doc.body.innerHTML;
        // 無限ループを防ぐため、一時的にonUpdateを無効化
        editor.commands.setContent(updatedHtml, false);
      }
      
      // 統計を更新
      const allTasks = doc.querySelectorAll('li[data-type="taskItem"]');
      const completedTasks = doc.querySelectorAll('li[data-type="taskItem"][data-checked="true"]');
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length
      });
      
      console.log('タスク統計:', {
        total: allTasks.length,
        completed: completedTasks.length,
        hasAutoUpdates: hasChanges
      });
    },
  });

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📝 親子タスク連動エディタ</h1>
      
      {/* 統計表示 */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="font-medium">📊 タスク統計</p>
        <p>完了: {stats.completedTasks}/{stats.totalTasks}</p>
        <p className="text-sm text-gray-600 mt-2">
          💡 子タスクをすべて完了すると親タスクも自動で完了します
        </p>
      </div>
      
      <div className="border border-gray-300 rounded-md p-4">
        <EditorContent
          editor={editor}
          className="prose w-full h-full outline-none checked-task"
        />
      </div>
      
      {/* 使い方説明 */}
      <div className="mt-4 p-3 bg-green-50 rounded text-sm">
        <p className="font-medium mb-2">🎯 動作確認方法:</p>
        <ol className="list-decimal list-inside space-y-1 text-gray-700">
          <li>親タスク1の子タスク1-1と1-2を両方完了してみてください</li>
          <li>親タスク1が自動で完了状態になります</li>
          <li>完了した子タスクのチェックを外すと親タスクも未完了に戻ります</li>
          <li>Tabキーで子タスクを作成できます</li>
        </ol>
      </div>
    </div>
  );
}