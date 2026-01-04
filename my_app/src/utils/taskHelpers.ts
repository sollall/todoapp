import type { Node } from '@tiptap/pm/model';
import type { TaskDetail, TaskProgress, TaskProgressItem } from '../types/task';

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

/**
 * 階層構造を考慮したタスク進捗を計算
 */
export function calculateTaskProgress(html: string): TaskProgress {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // ルートレベルのタスクリストを取得
  const rootTaskList = doc.querySelector('ul[data-type="taskList"]');

  if (!rootTaskList) {
    return { overall: 0, items: [] };
  }

  // ルートレベルのタスクアイテムを取得
  const rootTasks = Array.from(rootTaskList.querySelectorAll(':scope > li[data-type="taskItem"]'));

  if (rootTasks.length === 0) {
    return { overall: 0, items: [] };
  }

  // 各ルートタスクの重み（均等に分割）
  const rootWeight = 100 / rootTasks.length;

  // 各タスクの進捗を計算
  const items: TaskProgressItem[] = rootTasks.map(taskElement =>
    calculateTaskItemProgress(taskElement as Element, rootWeight)
  );

  // 全体の進捗を計算
  const overall = items.reduce((sum, item) => sum + (item.weight * item.progress / 100), 0);

  return {
    overall: Math.round(overall),
    items,
  };
}

/**
 * 個別のタスクアイテムの進捗を再帰的に計算
 */
function calculateTaskItemProgress(taskElement: Element, weight: number): TaskProgressItem {
  const text = getTaskText(taskElement);
  const isChecked = taskElement.getAttribute('data-checked') === 'true';

  // 子タスクリストを取得
  const childTaskList = taskElement.querySelector(':scope > div > ul[data-type="taskList"]');

  if (!childTaskList) {
    // 子タスクがない場合、完了していれば100%、未完了なら0%
    return {
      text,
      weight,
      progress: isChecked ? 100 : 0,
      children: [],
    };
  }

  // 子タスクを取得
  const childTasks = Array.from(childTaskList.querySelectorAll(':scope > li[data-type="taskItem"]'));

  if (childTasks.length === 0) {
    return {
      text,
      weight,
      progress: isChecked ? 100 : 0,
      children: [],
    };
  }

  // 各子タスクの重み（親タスク内で均等に分割）
  const childWeight = 100 / childTasks.length;

  // 子タスクの進捗を再帰的に計算
  const children: TaskProgressItem[] = childTasks.map(child =>
    calculateTaskItemProgress(child as Element, childWeight)
  );

  // このタスクの進捗は子タスクの加重平均
  const progress = children.reduce((sum, child) => sum + (child.weight * child.progress / 100), 0);

  return {
    text,
    weight,
    progress: Math.round(progress),
    children,
  };
}

/**
 * タスクエレメントからテキストを取得（子タスクのテキストを除外）
 */
function getTaskText(taskElement: Element): string {
  const contentDiv = taskElement.querySelector(':scope > div');
  if (!contentDiv) return '';

  // 子タスクリストを除外したテキストを取得
  const clone = contentDiv.cloneNode(true) as Element;
  const nestedList = clone.querySelector('ul[data-type="taskList"]');
  if (nestedList) {
    nestedList.remove();
  }

  return clone.textContent?.trim() || '';
}
