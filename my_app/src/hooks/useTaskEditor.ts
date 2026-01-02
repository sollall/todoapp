import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import type { TaskDetail, TaskStats } from '../types/task';
import {
  extractTaskDetail,
  extractTaskText,
  autoCompleteParentTasks,
  calculateTaskStats,
} from '../utils/taskHelpers';

interface UseTaskEditorProps {
  onTaskSelect: (task: TaskDetail) => void;
  onStatsUpdate: (stats: TaskStats) => void;
  onSelectedTaskUpdate: (updater: (current: TaskDetail | null) => TaskDetail | null) => void;
}

export function useTaskEditor({
  onTaskSelect,
  onStatsUpdate,
  onSelectedTaskUpdate,
}: UseTaskEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item-clickable',
        },
        onReadOnlyChecked: (_node, checked) => {
          return checked;
        },
      }),
    ],
    editorProps: {
      handleDOMEvents: {
        click: (view, event) => {
          const target = event.target as HTMLElement;

          // チェックボックスのクリックは通常の処理を継続
          if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
            // チェックボックスの処理後にタスク詳細も更新するため、
            // タスクアイテムを探す
            const taskItem = target.closest('li[data-type="taskItem"]');
            if (taskItem) {
              // チェックボックスの状態変更後にタスク詳細を更新するため、
              // 少し遅延させる
              setTimeout(() => {
                const pos = view.posAtDOM(taskItem, 0);
                const node = view.state.doc.nodeAt(pos);
                if (node && node.type.name === 'taskItem') {
                  const taskDetail = extractTaskDetail(node);
                  console.log('チェックボックスクリック後のタスク詳細:', taskDetail);
                  onTaskSelect(taskDetail);
                }
              }, 10);
            }
            return false; // 通常の処理を継続
          }

          // タスクアイテムを探す（最も近いものを取得）
          const taskItem = target.closest('li[data-type="taskItem"]');

          if (taskItem) {
            console.log('=== タスクアイテムがクリックされました（DOM） ===');

            try {
              // DOM要素からProseMirrorのポジションを取得
              const pos = view.posAtDOM(taskItem, 0);

              // そのポジションからノードを取得
              const $pos = view.state.doc.resolve(pos);

              // 最も近いtaskItemノードを探す
              let taskNode = null;
              for (let d = $pos.depth; d > 0; d--) {
                const node = $pos.node(d);
                if (node.type.name === 'taskItem') {
                  taskNode = node;
                  break;
                }
              }

              if (taskNode) {
                const taskDetail = extractTaskDetail(taskNode);
                console.log('クリックされたタスク詳細:', taskDetail);
                onTaskSelect(taskDetail);
                return true; // イベントを処理した
              }
            } catch (error) {
              console.error('タスク詳細の取得に失敗:', error);
            }
          }

          return false; // イベントを継続
        },
      },
    },
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

      // 親タスクの自動完了処理
      const { updatedHtml, hasChanges } = autoCompleteParentTasks(html);

      if (hasChanges) {
        editor.commands.setContent(updatedHtml, false);
      }

      // 統計を更新
      const stats = calculateTaskStats(html);
      onStatsUpdate(stats);

      console.log('タスク統計:', {
        ...stats,
        hasAutoUpdates: hasChanges,
      });

      // 選択中のタスクが更新された場合、詳細パネルも更新
      onSelectedTaskUpdate((currentTask) => {
        if (!currentTask) return null;

        let updatedTask: TaskDetail | null = null;

        editor.state.doc.descendants((node) => {
          if (node.type.name === 'taskItem') {
            const taskText = extractTaskText(node);

            if (taskText === currentTask.text) {
              updatedTask = extractTaskDetail(node);
              console.log('選択中のタスクを更新:', updatedTask);
              return false; // 探索を停止
            }
          }
        });

        return updatedTask || currentTask;
      });
    },
  });

  return editor;
}
