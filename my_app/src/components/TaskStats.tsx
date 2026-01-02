import type { TaskStats as TaskStatsType } from '../types/task';

interface TaskStatsProps {
  stats: TaskStatsType;
}

export function TaskStats({ stats }: TaskStatsProps) {
  return (
    <div className="mb-4 p-3 bg-blue-50 rounded">
      <p className="font-medium">📊 タスク統計</p>
      <p>完了: {stats.completedTasks}/{stats.totalTasks}</p>
      <p className="text-sm text-gray-600 mt-2">
        💡 子タスクをすべて完了すると親タスクも自動で完了します
      </p>
    </div>
  );
}
