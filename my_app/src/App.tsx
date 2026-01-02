import './styles.css';
import { EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { useTaskEditor } from './hooks/useTaskEditor';
import { TaskStats } from './components/TaskStats';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import type { TaskDetail, TaskStats as TaskStatsType } from './types/task';

export default function App() {
  const [stats, setStats] = useState<TaskStatsType>({
    totalTasks: 0,
    completedTasks: 0,
  });
  const [selectedTask, setSelectedTask] = useState<TaskDetail | null>(null);

  // デバッグ用: selectedTaskの変化を監視
  useEffect(() => {
    console.log('selectedTaskが変更されました:', selectedTask);
  }, [selectedTask]);

  const editor = useTaskEditor({
    onTaskSelect: setSelectedTask,
    onStatsUpdate: setStats,
    onSelectedTaskUpdate: setSelectedTask,
  });

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* 左側：タスクリスト */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          borderRight: '1px solid #e5e7eb',
        }}
      >
        <h1 className="text-2xl font-bold mb-4">📝 親子タスク連動エディタ</h1>

        <TaskStats stats={stats} />

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
            <li>
              <strong>タスクをクリックすると右側に詳細が表示されます</strong>
            </li>
          </ol>
        </div>
      </div>

      {/* 右側：タスク詳細パネル */}
      <TaskDetailPanel selectedTask={selectedTask} />
    </div>
  );
}
