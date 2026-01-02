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
 * 親タスクの自動完了処理
 */
export function autoCompleteParentTasks(html: string): {
  updatedHtml: string;
  hasChanges: boolean;
} {
  const doc = new DOMParser().parseFromString(html, 'text/html');
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
        } else if (!allChildrenCompleted && parentChecked) {
          parentTask.setAttribute('data-checked', 'false');
          hasChanges = true;
        }
      }
    }
  });

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
