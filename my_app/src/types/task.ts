export interface TaskDetail {
  text: string;
  checked: boolean;
  hasChildren: boolean;
  childrenCount: number;
  completedChildrenCount: number;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
}

export interface TaskProgressItem {
  text: string;
  weight: number;
  progress: number;
  children: TaskProgressItem[];
}

export interface TaskProgress {
  overall: number;
  items: TaskProgressItem[];
}
