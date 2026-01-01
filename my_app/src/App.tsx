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
    <div className="flex h-screen">
      {/* メインコンテンツエリア */}
      <div className={`flex-1 p-6 transition-all duration-300 ${selectedTask ? 'mr-96' : ''}`}>
        <div className="max-w-2xl mx-auto">
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
              <li><strong>タスクをクリックすると詳細パネルが開きます</strong></li>
            </ol>
          </div>
        </div>
      </div>

      {/* タスク詳細パネル（スライドイン） */}
      <div
        className={`fixed right-0 top-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          selectedTask ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedTask && (
          <div className="h-full flex flex-col">
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="text-lg font-bold">📋 タスク詳細</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {/* コンテンツ */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* タスクテキスト */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 block mb-2">タスク名</label>
                <div className={`text-lg p-3 bg-gray-50 rounded ${selectedTask.checked ? 'line-through opacity-60' : ''}`}>
                  {selectedTask.text}
                </div>
              </div>

              {/* ステータス */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-600 block mb-2">ステータス</label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTask.checked
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {selectedTask.checked ? '✓ 完了' : '○ 未完了'}
                </div>
              </div>

              {/* 子タスク情報 */}
              {selectedTask.hasChildren && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-gray-600 block mb-2">子タスク</label>
                  <div className="p-4 bg-blue-50 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-700">完了状況</span>
                      <span className="font-bold text-blue-700">
                        {selectedTask.completedChildrenCount} / {selectedTask.childrenCount}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 情報メッセージ */}
              <div className="p-3 bg-gray-50 rounded text-sm text-gray-600">
                <p className="mb-2">💡 <strong>ヒント:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>チェックボックスをクリックして完了/未完了を切り替え</li>
                  <li>Tabキーで子タスクを作成</li>
                  {selectedTask.hasChildren && (
                    <li>すべての子タスクを完了すると親タスクも自動完了</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* オーバーレイ（パネルが開いているとき） */}
      {selectedTask && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 transition-opacity duration-300"
          onClick={() => setSelectedTask(null)}
          style={{ zIndex: -1 }}
        />
      )}
    </div>
  );
}