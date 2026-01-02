import type { Node } from '@tiptap/pm/model';
import type { TaskDetail } from '../types/task';

/**
 * Tiptapノードからタスクのテキストを抽出
 */
export function extractTaskText(node: Node): string {
  let taskText = '';
  node.content.forEach((child) => {
    if (child.type.name === 'paragraph' || child.type.name === 'text') {
      taskText += child.textContent;
    }
  });
  return taskText.trim() || 'タスク';
}

/**
 * Tiptapノードから子タスク情報を抽出
 */
export function extractChildTasksInfo(node: Node): {
  childrenCount: number;
  completedChildrenCount: number;
} {
  let childrenCount = 0;
  let completedChildrenCount = 0;

  node.content.forEach((child) => {
    if (child.type.name === 'taskList') {
      child.content.forEach((taskItem) => {
        if (taskItem.type.name === 'taskItem') {
          childrenCount++;
          if (taskItem.attrs.checked) {
            completedChildrenCount++;
          }
        }
      });
    }
  });

  return { childrenCount, completedChildrenCount };
}

/**
 * Tiptapノードからタスク詳細を抽出
 */
export function extractTaskDetail(node: Node): TaskDetail {
  const taskText = extractTaskText(node);
  const isChecked = node.attrs.checked || false;
  const { childrenCount, completedChildrenCount } = extractChildTasksInfo(node);

  return {
    text: taskText,
    checked: isChecked,
    hasChildren: childrenCount > 0,
    childrenCount,
    completedChildrenCount,
  };
}

/**
 * 親タスクの自動完了処理（再帰的にすべての階層を処理）
 */
export function autoCompleteParentTasks(html: string): {
  updatedHtml: string;
  hasChanges: boolean;
} {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  let hasChanges = false;

  // 再帰的に処理を繰り返す（孫タスクの変更が子タスクに影響し、子タスクの変更が親に影響するため）
  let maxIterations = 10; // 無限ループを防ぐ
  let iterationHasChanges = true;

  while (iterationHasChanges && maxIterations > 0) {
    iterationHasChanges = false;
    maxIterations--;

    // すべてのタスクアイテムを取得（深い階層から処理するため配列を逆順にする）
    const allTasks = Array.from(doc.querySelectorAll('li[data-type="taskItem"]')).reverse();

    allTasks.forEach(taskItem => {
      // 直下の子タスクリストを取得
      const childTaskList = taskItem.querySelector(':scope > div > ul[data-type="taskList"]');

      if (childTaskList) {
        // 直下の子タスクのみを取得（孫タスクは除外）
        const childTasks = childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]');

        if (childTasks.length > 0) {
          // すべての子タスクが完了しているかチェック
          const allChildrenCompleted = Array.from(childTasks).every(child =>
            child.getAttribute('data-checked') === 'true'
          );

          // 親タスクの現在の状態
          const parentChecked = taskItem.getAttribute('data-checked') === 'true';

          // 子タスクがすべて完了していて、親が未完了の場合
          if (allChildrenCompleted && !parentChecked) {
            taskItem.setAttribute('data-checked', 'true');
            iterationHasChanges = true;
            hasChanges = true;
          }
          // 子タスクに未完了があって、親が完了している場合
          else if (!allChildrenCompleted && parentChecked) {
            taskItem.setAttribute('data-checked', 'false');
            iterationHasChanges = true;
            hasChanges = true;
          }
        }
      }
    });
  }

  return {
    updatedHtml: doc.body.innerHTML,
    hasChanges,
  };
}

/**
 * タスク統計を計算
 */
export function calculateTaskStats(html: string): {
  totalTasks: number;
  completedTasks: number;
} {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const allTasks = doc.querySelectorAll('li[data-type="taskItem"]');
  const completedTasks = doc.querySelectorAll('li[data-type="taskItem"][data-checked="true"]');

  return {
    totalTasks: allTasks.length,
    completedTasks: completedTasks.length,
  };
}
