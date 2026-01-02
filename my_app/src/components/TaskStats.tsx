import type { TaskStats as TaskStatsType } from '../types/task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskStatsProps {
  stats: TaskStatsType;
}

export function TaskStats({ stats }: TaskStatsProps) {
  const { themeConfig } = useTheme();
  const percentage = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: themeConfig.colors.surface,
        borderRadius: '12px',
        border: `1px solid ${themeConfig.colors.border}`,
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px', marginRight: '8px' }}>📊</span>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeConfig.colors.text, margin: 0 }}>
          タスク統計
        </h3>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '12px' }}>
        <span style={{ fontSize: '32px', fontWeight: '700', color: themeConfig.colors.text }}>
          {stats.completedTasks}
        </span>
        <span style={{ fontSize: '18px', color: themeConfig.colors.textSecondary, marginLeft: '4px' }}>
          / {stats.totalTasks}
        </span>
        <span style={{ fontSize: '14px', color: themeConfig.colors.textSecondary, marginLeft: '8px' }}>
          タスク完了
        </span>
      </div>

      {/* プログレスバー */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: themeConfig.colors.border,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}
      >
        <div
          style={{
            height: '100%',
            background: themeConfig.colors.primary,
            borderRadius: '4px',
            transition: 'width 0.3s ease',
            width: `${percentage}%`,
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: themeConfig.colors.textSecondary }}>
          💡 子タスクをすべて完了すると親タスクも自動で完了します
        </span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: themeConfig.colors.primary }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
