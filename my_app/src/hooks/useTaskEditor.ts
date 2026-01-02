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
      handleClickOn: (view, pos, node, _nodePos, event) => {
        console.log('=== handleClickOn 呼び出し ===');
        console.log('pos:', pos);
        console.log('node type:', node.type.name);

        const target = event.target as HTMLElement;

        // チェックボックスのクリックも処理する
        const isCheckbox = target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox';

        // posからResolvedPosを取得
        const $pos = view.state.doc.resolve(pos);

        // クリックされた位置から最も近いtaskItemノードを探す
        let taskItemNode = null;
        for (let d = $pos.depth; d > 0; d--) {
          const currentNode = $pos.node(d);
          if (currentNode.type.name === 'taskItem') {
            taskItemNode = currentNode;
            break;
          }
        }

        if (taskItemNode) {
          console.log('✓ タスクアイテムを検出しました');

          const taskDetail = extractTaskDetail(taskItemNode);
          console.log('タスク詳細:', taskDetail);

          if (isCheckbox) {
            // チェックボックスの場合は少し遅延させて状態変更後の値を取得
            setTimeout(() => {
              // 再度ノードを取得して最新の状態を反映
              const $newPos = view.state.doc.resolve(pos);
              for (let d = $newPos.depth; d > 0; d--) {
                const currentNode = $newPos.node(d);
                if (currentNode.type.name === 'taskItem') {
                  const updatedDetail = extractTaskDetail(currentNode);
                  console.log('チェックボックス後の詳細:', updatedDetail);
                  onTaskSelect(updatedDetail);
                  break;
                }
              }
            }, 10);
          } else {
            // 通常のクリックはすぐに反映
            onTaskSelect(taskDetail);
          }

          // チェックボックスの場合は通常の処理も継続
          return isCheckbox ? false : true;
        }

        return false;
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
