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
        const childTaskList = parentTask.querySelector('ul[data-type="taskList"]');
        
        if (childTaskList) {
          const childTasks = childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]');
          
          if (childTasks.length > 0) {
            const allChildrenCompleted = Array.from(childTasks).every(child => 
              child.getAttribute('data-checked') === 'true'
            );
            
            const parentChecked = parentTask.getAttribute('data-checked') === 'true';
            
            if (allChildrenCompleted && !parentChecked) {
              parentTask.setAttribute('data-checked', 'true');
              hasChanges = true;
            }
            else if (!allChildrenCompleted && parentChecked) {
              parentTask.setAttribute('data-checked', 'false');
              hasChanges = true;
            }
          }
        }
      });
      
      if (hasChanges) {
        const updatedHtml = doc.body.innerHTML;
        editor.commands.setContent(updatedHtml, false);
      }
      
      // 統計を更新
      const allTasks = doc.querySelectorAll('li[data-type="taskItem"]');
      const completedTasks = doc.querySelectorAll('li[data-type="taskItem"][data-checked="true"]');
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length
      });
    },
  });

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0
    }}>
      {/* 左側 - 可変幅（右側を除いた残り全部） */}
      <div style={{ 
        flex: 1,
        padding: '24px', 
        overflow: 'auto',
        minWidth: 0  // flexboxで必要
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
          📝 親子タスク連動エディタ
        </h1>
        
        {/* 統計表示 */}
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          backgroundColor: '#dbeafe', 
          borderRadius: '8px' 
        }}>
          <p style={{ fontWeight: '600' }}>📊 タスク統計</p>
          <p>完了: {stats.completedTasks}/{stats.totalTasks}</p>
          <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '8px' }}>
            💡 子タスクをすべて完了すると親タスクも自動で完了します
          </p>
        </div>
        
        <div style={{ 
          border: '1px solid #d1d5db', 
          borderRadius: '6px', 
          padding: '16px',
          backgroundColor: 'white',
          minHeight: '400px'
        }}>
          <EditorContent
            editor={editor}
            className="prose w-full h-full outline-none checked-task"
          />
        </div>
        
        {/* 使い方説明 */}
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          backgroundColor: '#dcfce7', 
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <p style={{ fontWeight: '600', marginBottom: '8px' }}>🎯 動作確認方法:</p>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.5' }}>
            <li>親タスク1の子タスク1-1と1-2を両方完了してみてください</li>
            <li>親タスク1が自動で完了状態になります</li>
            <li>完了した子タスクのチェックを外すと親タスクも未完了に戻ります</li>
            <li>Tabキーで子タスクを作成できます</li>
          </ol>
        </div>
      </div>

      {/* 右側 - 固定幅 */}
      <div style={{ 
        width: '400px',  // 固定幅
        backgroundColor: 'white', 
        borderLeft: '1px solid #d1d5db',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ヘッダー */}
        <div style={{ 
          padding: '16px', 
          borderBottom: '1px solid #d1d5db', 
          backgroundColor: '#f9fafb' 
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>📋 右側パネル</h2>
        </div>
        
        {/* コンテンツ */}
        <div style={{ flex: 1, padding: '16px' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: 'bold', 
              color: '#2563eb', 
              marginBottom: '16px' 
            }}>
              Hello World
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              右側のコンテンツエリアです（固定幅400px）
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#dbeafe', 
                borderRadius: '8px' 
              }}>
                <p style={{ color: '#1e40af', fontWeight: '600' }}>詳細情報</p>
                <p style={{ color: '#2563eb', fontSize: '14px', marginTop: '4px' }}>
                  ここに詳細情報が表示されます
                </p>
              </div>
              
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#dcfce7', 
                borderRadius: '8px' 
              }}>
                <p style={{ color: '#166534', fontWeight: '600' }}>統計情報</p>
                <p style={{ color: '#16a34a', fontSize: '14px', marginTop: '4px' }}>
                  総タスク: {stats.totalTasks}<br />
                  完了済み: {stats.completedTasks}
                </p>
              </div>
              
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px' 
              }}>
                <p style={{ color: '#92400e', fontWeight: '600' }}>進捗率</p>
                <p style={{ color: '#d97706', fontSize: '14px', marginTop: '4px' }}>
                  {stats.totalTasks > 0 ? 
                    `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%` : 
                    '0%'
                  } 完了
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* フッター */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #d1d5db', 
          backgroundColor: '#f9fafb' 
        }}>
          <button style={{
            width: '100%',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            アクション
          </button>
        </div>
      </div>
    </div>
  );
}