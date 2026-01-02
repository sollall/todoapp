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
