import type { TaskProgress, TaskProgressItem } from '../types/task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskProgressDisplayProps {
  progress: TaskProgress;
}

export function TaskProgressDisplay({ progress }: TaskProgressDisplayProps) {
  const { themeConfig } = useTheme();

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
      {/* 全体の進捗 */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ fontSize: '24px', marginRight: '8px' }}>📊</span>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: themeConfig.colors.text, margin: 0 }}>
            全体の進捗
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '12px' }}>
          <span style={{ fontSize: '48px', fontWeight: '700', color: themeConfig.colors.text }}>
            {progress.overall}
          </span>
          <span style={{ fontSize: '24px', color: themeConfig.colors.textSecondary, marginLeft: '4px' }}>
            %
          </span>
        </div>

        {/* 全体のプログレスバー */}
        <div
          style={{
            width: '100%',
            height: '12px',
            backgroundColor: themeConfig.colors.border,
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: themeConfig.colors.primary,
              borderRadius: '6px',
              transition: 'width 0.3s ease',
              width: `${progress.overall}%`,
            }}
          />
        </div>
      </div>

      {/* 各タスクの詳細 */}
      {progress.items.length > 0 && (
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: themeConfig.colors.textSecondary,
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            タスク別進捗
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {progress.items.map((item, index) => (
              <TaskProgressItemDisplay
                key={index}
                item={item}
                depth={0}
                themeConfig={themeConfig}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface TaskProgressItemDisplayProps {
  item: TaskProgressItem;
  depth: number;
  themeConfig: any;
}

function TaskProgressItemDisplay({ item, depth, themeConfig }: TaskProgressItemDisplayProps) {
  const marginLeft = depth * 16;

  return (
    <div style={{ marginLeft: `${marginLeft}px` }}>
      <div
        style={{
          padding: '10px 12px',
          backgroundColor: themeConfig.colors.background,
          borderRadius: '6px',
          border: `1px solid ${themeConfig.colors.border}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{
            fontSize: '13px',
            color: themeConfig.colors.text,
            fontWeight: '500',
            flex: 1,
          }}>
            {item.text}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              color: themeConfig.colors.textSecondary,
              backgroundColor: themeConfig.colors.surface,
              padding: '2px 8px',
              borderRadius: '4px',
            }}>
              重み {item.weight.toFixed(1)}%
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: '600',
              color: item.progress === 100 ? themeConfig.colors.success : themeConfig.colors.text,
            }}>
              {item.progress}%
            </span>
          </div>
        </div>

        {/* このタスクのプログレスバー */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: themeConfig.colors.border,
            borderRadius: '3px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              background: item.progress === 100 ? themeConfig.colors.success : themeConfig.colors.primary,
              borderRadius: '3px',
              transition: 'width 0.3s ease',
              width: `${item.progress}%`,
            }}
          />
        </div>
      </div>

      {/* 子タスクを再帰的に表示 */}
      {item.children.length > 0 && (
        <div style={{ marginTop: '6px' }}>
          {item.children.map((child, index) => (
            <TaskProgressItemDisplay
              key={index}
              item={child}
              depth={depth + 1}
              themeConfig={themeConfig}
            />
          ))}
        </div>
      )}
    </div>
  );
}
