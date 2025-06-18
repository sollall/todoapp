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
  
  // 右側画面の状態管理
  const [rightPanelContent, setRightPanelContent] = useState('default');
  const [clickedTaskName, setClickedTaskName] = useState('');

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
    onCreate: ({ editor }) => {
      // エディタ作成時にクリックイベントを設定
      const editorElement = editor.view.dom;
      
      editorElement.addEventListener('click', (event) => {
        // チェックボックスのクリックは無視
        if (event.target.type === 'checkbox') {
          return;
        }

        // タスクアイテムを探す
        const taskItem = event.target.closest('li[data-type="taskItem"]');
        
        if (taskItem) {
          // タスクのテキストを取得
          const taskText = Array.from(taskItem.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE || 
                           (node.nodeType === Node.ELEMENT_NODE && !node.matches('ul')))
            .map(node => node.textContent)
            .join('')
            .trim();

          if (taskText) {
            console.log('クリックされたタスク:', taskText);
            setClickedTaskName(taskText);
            setRightPanelContent('task-detail');
          }
        }
      });
    }
  });

  // テスト用ボタンハンドラー
  const handleTestClick = (contentType) => {
    setRightPanelContent(contentType);
    setClickedTaskName('テストタスク');
  };

  // 右側のコンテンツを返す関数
  const renderRightContent = () => {
    switch (rightPanelContent) {
      case 'task-detail':
        return (
          <div>
            <div style={{ 
              textAlign: 'center',
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#dbeafe',
              borderRadius: '8px'
            }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: '#2563eb', 
                marginBottom: '8px' 
              }}>
                Hello World
              </h1>
              <p style={{ color: '#1e40af' }}>
                タスク「{clickedTaskName}」の詳細画面
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📋 タスク詳細情報
              </h3>
              <div style={{ 
                backgroundColor: '#f9fafb', 
                borderRadius: '8px', 
                padding: '16px' 
              }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong>タスク名:</strong> {clickedTaskName}
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>🏷️ タグ:</strong> 
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: '#e0e7ff',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    重要
                  </span>
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>🔥 優先度:</strong> 高
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong>📅 期限:</strong> 2025-01-31
                </p>
                <p>
                  <strong>👤 担当者:</strong> 田中太郎
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                📝 補足情報
              </h3>
              <div style={{ 
                backgroundColor: '#f0fdf4', 
                borderRadius: '8px', 
                padding: '16px',
                fontSize: '14px'
              }}>
                このタスクは最優先で対応が必要です。関連部署との調整も含めて進めてください。
              </div>
            </div>
          </div>
        );

      case 'test-content':
        return (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', color: '#dc2626', marginBottom: '16px' }}>
              テスト画面
            </h1>
            <p>ボタンクリックで画面が切り替わりました！</p>
          </div>
        );

      default:
        return (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
              タスクを選択してください
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
              左側のエディタでタスクの文字部分をクリックすると<br />
              詳細情報がここに表示されます
            </p>
            
            {/* テスト用ボタン */}
            <div style={{ marginTop: '32px' }}>
              <button 
                onClick={() => handleTestClick('test-content')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                テスト画面に切り替え
              </button>
              <button 
                onClick={() => handleTestClick('task-detail')}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                タスク詳細画面に切り替え
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw',
      backgroundColor: '#f9fafb',
      margin: 0,
      padding: 0
    }}>
      {/* 左側 */}
      <div style={{ 
        flex: 1,
        padding: '24px', 
        overflow: 'auto',
        minWidth: 0
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
            style={{ cursor: 'pointer' }}
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
            <li>🆕 タスクの文字部分をクリックすると右側に詳細が表示されます</li>
          </ol>
        </div>

        {/* デバッグ情報 */}
        <div style={{
          marginTop: '16px',
          padding: '8px',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          fontSize: '12px'
        }}>
          現在の右画面: {rightPanelContent} | クリックされたタスク: {clickedTaskName || '未選択'}
        </div>
      </div>

      {/* 右側 */}
      <div style={{ 
        width: '400px',
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
          <h2 style={{ fontSize: '18px', fontWeight: '600' }}>
            📋 詳細パネル ({rightPanelContent})
          </h2>
        </div>
        
        {/* コンテンツ */}
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          {renderRightContent()}
        </div>
        
        {/* フッター */}
        <div style={{ 
          padding: '16px', 
          borderTop: '1px solid #d1d5db', 
          backgroundColor: '#f9fafb' 
        }}>
          <button 
            onClick={() => {
              setRightPanelContent('default');
              setClickedTaskName('');
            }}
            style={{
              width: '100%',
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            リセット
          </button>
        </div>
      </div>
    </div>
  );
}