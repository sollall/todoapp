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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 左側：タスクリスト */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        borderRight: '1px solid #e5e7eb'
      }}>
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
            🧪 詳細パネル表示テスト
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
            <li><strong>タスクをクリックすると右側に詳細が表示されます</strong></li>
          </ol>
        </div>
      </div>

      {/* 右側：タスク詳細パネル */}
      <div style={{
        width: '400px',
        overflowY: 'auto',
        backgroundColor: '#f9fafb',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#111827'
        }}>
          📋 タスク詳細
        </h2>

        {selectedTask ? (
          <div>
            {/* タスクテキスト */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563',
                display: 'block',
                marginBottom: '8px'
              }}>
                タスク名
              </label>
              <div style={{
                fontSize: '16px',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
                textDecoration: selectedTask.checked ? 'line-through' : 'none',
                opacity: selectedTask.checked ? 0.6 : 1
              }}>
                {selectedTask.text}
              </div>
            </div>

            {/* ステータス */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563',
                display: 'block',
                marginBottom: '8px'
              }}>
                ステータス
              </label>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
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
                <label style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#4b5563',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  子タスク
                </label>
                <div style={{
                  padding: '16px',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #dbeafe'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{ fontSize: '14px', color: '#374151' }}>完了状況</span>
                    <span style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '16px' }}>
                      {selectedTask.completedChildrenCount} / {selectedTask.childrenCount}
                    </span>
                  </div>
                  <div style={{
                    width: '100%',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '10px'
                  }}>
                    <div style={{
                      backgroundColor: '#2563eb',
                      height: '10px',
                      borderRadius: '9999px',
                      width: `${(selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'right'
                  }}>
                    {Math.round((selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100)}% 完了
                  </div>
                </div>
              </div>
            )}

            {/* 情報メッセージ */}
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#4b5563',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ marginBottom: '8px', fontWeight: '500' }}>💡 ヒント:</p>
              <ul style={{
                listStyleType: 'disc',
                paddingLeft: '20px',
                margin: 0,
                fontSize: '12px',
                lineHeight: '1.6'
              }}>
                <li>チェックボックスをクリックして完了/未完了を切り替え</li>
                <li>Tabキーで子タスクを作成</li>
                {selectedTask.hasChildren && (
                  <li>すべての子タスクを完了すると親タスクも自動完了</li>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <p style={{ fontSize: '14px' }}>タスクを選択すると</p>
            <p style={{ fontSize: '14px' }}>詳細がここに表示されます</p>
          </div>
        )}
      </div>
    </div>
  );
}