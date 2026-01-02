import type { TaskDetail } from '../types/task';
import { useTheme } from '../contexts/ThemeContext';

interface TaskDetailPanelProps {
  selectedTask: TaskDetail | null;
}

export function TaskDetailPanel({ selectedTask }: TaskDetailPanelProps) {
  const { themeConfig } = useTheme();

  return (
    <div style={{
      width: '400px',
      overflowY: 'auto',
      backgroundColor: themeConfig.colors.surface,
      padding: '24px',
      borderLeft: `1px solid ${themeConfig.colors.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px', marginRight: '8px' }}>📋</span>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          margin: 0,
          color: themeConfig.colors.text
        }}>
          タスク詳細
        </h2>
      </div>

      {selectedTask ? (
        <div>
          {/* タスクテキスト */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: themeConfig.colors.textSecondary,
              display: 'block',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              タスク名
            </label>
            <div style={{
              fontSize: '18px',
              padding: '16px',
              backgroundColor: themeConfig.colors.background,
              borderRadius: '8px',
              border: `1px solid ${themeConfig.colors.border}`,
              textDecoration: selectedTask.checked ? 'line-through' : 'none',
              opacity: selectedTask.checked ? 0.6 : 1,
              color: themeConfig.colors.text,
              fontWeight: '500',
            }}>
              {selectedTask.text}
            </div>
          </div>

          {/* ステータス */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              fontSize: '13px',
              fontWeight: '600',
              color: themeConfig.colors.textSecondary,
              display: 'block',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              ステータス
            </label>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: '600',
              backgroundColor: selectedTask.checked ? themeConfig.colors.successLight : themeConfig.colors.warningLight,
              color: selectedTask.checked ? themeConfig.colors.success : themeConfig.colors.warning,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <span style={{ marginRight: '6px' }}>
                {selectedTask.checked ? '✓' : '○'}
              </span>
              {selectedTask.checked ? '完了' : '未完了'}
            </div>
          </div>

          {/* 子タスク情報 */}
          {selectedTask.hasChildren && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '13px',
                fontWeight: '600',
                color: themeConfig.colors.textSecondary,
                display: 'block',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                子タスク
              </label>
              <div style={{
                padding: '20px',
                backgroundColor: themeConfig.colors.background,
                borderRadius: '8px',
                border: `1px solid ${themeConfig.colors.border}`,
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{ fontSize: '14px', color: themeConfig.colors.textSecondary }}>完了状況</span>
                  <span style={{ fontWeight: 'bold', color: themeConfig.colors.text, fontSize: '18px' }}>
                    {selectedTask.completedChildrenCount} / {selectedTask.childrenCount}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  backgroundColor: themeConfig.colors.border,
                  borderRadius: '9999px',
                  height: '12px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    background: themeConfig.colors.primary,
                    height: '12px',
                    borderRadius: '9999px',
                    width: `${(selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100}%`,
                    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                </div>
                <div style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: themeConfig.colors.textSecondary,
                  textAlign: 'right',
                  fontWeight: '600',
                }}>
                  {Math.round((selectedTask.completedChildrenCount / selectedTask.childrenCount) * 100)}% 完了
                </div>
              </div>
            </div>
          )}

          {/* 情報メッセージ */}
          <div style={{
            padding: '16px',
            backgroundColor: themeConfig.colors.background,
            borderRadius: '8px',
            fontSize: '13px',
            color: themeConfig.colors.textSecondary,
            border: `1px solid ${themeConfig.colors.border}`,
          }}>
            <p style={{ marginBottom: '10px', fontWeight: '600', color: themeConfig.colors.text }}>
              💡 ヒント
            </p>
            <ul style={{
              listStyleType: 'disc',
              paddingLeft: '20px',
              margin: 0,
              fontSize: '12px',
              lineHeight: '1.8'
            }}>
              <li>チェックボックスをクリックして完了/未完了を切り替え</li>
              <li>Tabキーで子タスクを作成</li>
              {selectedTask.hasChildren && (
                <li>すべての子タスクを完了すると親タスクも自動完了</li>
              )}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: themeConfig.colors.textSecondary
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.4 }}>📝</div>
          <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>タスクを選択</p>
          <p style={{ fontSize: '14px' }}>詳細がここに表示されます</p>
        </div>
      )}
    </div>
  );
}
