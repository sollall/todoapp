import './styles.css';
import { EditorContent } from '@tiptap/react';
import { useState, useEffect } from 'react';
import { useTaskEditor } from './hooks/useTaskEditor';
import { TaskStats } from './components/TaskStats';
import { TaskDetailPanel } from './components/TaskDetailPanel';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import type { TaskDetail, TaskStats as TaskStatsType } from './types/task';

function AppContent() {
  const { themeConfig } = useTheme();
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
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: themeConfig.colors.background,
    }}>
      {/* 左側：タスクリスト */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          borderRight: `1px solid ${themeConfig.colors.border}`,
          backgroundColor: themeConfig.colors.background,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '32px', marginRight: '12px' }}>📝</span>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            margin: 0,
            color: themeConfig.colors.text,
          }}>
            タスク管理
          </h1>
        </div>

        {/* テーマ切り替え */}
        <div style={{ marginBottom: '20px' }}>
          <ThemeSwitcher />
        </div>

        <TaskStats stats={stats} />

        <div style={{
          border: `1px solid ${themeConfig.colors.border}`,
          borderRadius: '12px',
          padding: '16px',
          backgroundColor: themeConfig.colors.surface,
        }}>
          <EditorContent
            editor={editor}
            className="prose w-full h-full outline-none checked-task"
          />
        </div>

        {/* 使い方説明 */}
        <div style={{
          marginTop: '16px',
          padding: '16px',
          backgroundColor: themeConfig.colors.surface,
          borderRadius: '12px',
          fontSize: '13px',
          border: `1px solid ${themeConfig.colors.border}`,
        }}>
          <p style={{
            fontWeight: '600',
            marginBottom: '12px',
            color: themeConfig.colors.text,
          }}>
            🎯 使い方
          </p>
          <ul style={{
            listStyle: 'disc',
            paddingLeft: '20px',
            margin: 0,
            color: themeConfig.colors.textSecondary,
            lineHeight: '1.8',
          }}>
            <li>子タスクをすべて完了すると親タスクも自動完了</li>
            <li>Tabキーで子タスクを作成</li>
            <li>タスクをクリックすると右側に詳細が表示</li>
            <li>上部のボタンでテーマを切り替えてデザインを変更できます</li>
          </ul>
        </div>
      </div>

      {/* 右側：タスク詳細パネル */}
      <TaskDetailPanel selectedTask={selectedTask} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
