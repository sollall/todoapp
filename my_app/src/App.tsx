import './styles.css'
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { useState, useEffect } from "react";

interface TaskDetail {
  text: string;
  checked: boolean;
  hasChildren: boolean;
  childrenCount: number;
  completedChildrenCount: number;
}

export default function App() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0
  });
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  // デバッグ用: selectedTaskの変化を監視
  useEffect(() => {
    console.log('selectedTaskが変更されました:', selectedTask);
  }, [selectedTask]);

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

  // タスククリック時のイベントハンドラー
  useEffect(() => {
    const handleTaskClick = (e: Event) => {
      console.log('クリックイベント発生:', e.target);
      const target = e.target as HTMLElement;
      const taskItem = target.closest('li[data-type="taskItem"]');

      console.log('タスクアイテム:', taskItem);

      if (taskItem && !target.closest('input[type="checkbox"]')) {
        console.log('タスク詳細を表示します');
        const taskText = taskItem.textContent?.trim() || '';
        const isChecked = taskItem.getAttribute('data-checked') === 'true';
        const childTaskList = taskItem.querySelector('ul[data-type="taskList"]');

        let childrenCount = 0;
        let completedChildrenCount = 0;

        if (childTaskList) {
          const childTasks = childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]');
          childrenCount = childTasks.length;
          completedChildrenCount = Array.from(childTasks).filter(
            child => child.getAttribute('data-checked') === 'true'
          ).length;
        }

        const taskDetail = {
          text: taskText,
          checked: isChecked,
          hasChildren: childrenCount > 0,
          childrenCount,
          completedChildrenCount,
        };

        console.log('タスク詳細:', taskDetail);
        setSelectedTask(taskDetail);
      } else {
        console.log('チェックボックスまたは非タスク要素がクリックされました');
      }
    };

    const editorElement = document.querySelector('.tiptap');
    console.log('エディタ要素:', editorElement);

    if (editorElement) {
      console.log('イベントリスナーを追加しました');
      editorElement.addEventListener('click', handleTaskClick);
    } else {
      console.warn('エディタ要素が見つかりません');
    }

    return () => {
      if (editorElement) {
        console.log('イベントリスナーを削除しました');
        editorElement.removeEventListener('click', handleTaskClick);
      }
    };
  }, [editor]);

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

      {/* デバッグ用テストボタン */}
      <div className="mb-4">
        <button
          onClick={() => {
            console.log('テストボタンがクリックされました');
            setSelectedTask({
              text: 'テストタスク',
              checked: false,
              hasChildren: true,
              childrenCount: 3,
              completedChildrenCount: 1,
            });
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          🧪 モーダル表示テスト
        </button>
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
          <li><strong>タスクをクリックすると詳細モーダルが開きます</strong></li>
        </ol>
      </div>

      {/* モーダル（中央表示） */}
      {selectedTask && (
        <>
          {/* 背景オーバーレイ */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
            onClick={() => setSelectedTask(null)}
          >
            {/* モーダルコンテンツ */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                width: '500px',
                maxWidth: '90%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ヘッダー */}
              <div style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f9fafb'
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>📋 タスク詳細</h2>
                <button
                  onClick={() => setSelectedTask(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0 8px'
                  }}
                >
                  ×
                </button>
              </div>

              {/* コンテンツ */}
              <div style={{ padding: '20px' }}>
                {/* タスクテキスト */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                    タスク名
                  </label>
                  <div style={{
                    fontSize: '18px',
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    textDecoration: selectedTask.checked ? 'line-through' : 'none',
                    opacity: selectedTask.checked ? 0.6 : 1
                  }}>
                    {selectedTask.text}
                  </div>
                </div>

                {/* ステータス */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                    ステータス
                  </label>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: '9999px',
                    fontSize: '14px',
                    fontWeight: '500',
                    backgroundColor: selectedTask.checked ? '#d1fae5' : '#fef3c7',
                    color: selectedTask.checked ? '#065f46' : '#92400e'
                  }}>
                    {selectedTask.checked ? '✓ 完了' : '○ 未完了'}
                  </div>
                </div>

                {/* 子タスク情報 */}
                {selectedTask.hasChildren && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '14px', fontWeight: '500', color: '#4b5563', display: 'block', marginBottom: '8px' }}>
                      子タスク
                    </label>
                    <div style={{ padding: '16px', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '14px', color: '#374151' }}>完了状況</span>
                        <span style={{ fontWeight: 'bold', color: '#1e40af' }}>
                          {selectedTask.completedChildrenCount} / {selectedTask.childrenCount}
                        </span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#d1d5db', borderRadius: '9999px', height: '8px' }}>
                        <div style={{
                          backgroundColor: '#2563eb',
                          height: '8px',
                          borderRadius: '9999px',
                          width: `${(selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100}%`,
                          transition: 'width 0.3s'
                        }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* 情報メッセージ */}
                <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '14px', color: '#4b5563' }}>
                  <p style={{ marginBottom: '8px' }}>💡 <strong>ヒント:</strong></p>
                  <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: 0, fontSize: '12px' }}>
                    <li>チェックボックスをクリックして完了/未完了を切り替え</li>
                    <li>Tabキーで子タスクを作成</li>
                    {selectedTask.hasChildren && (
                      <li>すべての子タスクを完了すると親タスクも自動完了</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}